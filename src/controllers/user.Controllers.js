import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResonse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validatevalidateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

// Ensure multer middleware is correctly applied in the route
const userRegister = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  console.log("UserName: ", userName);
  console.log("email: ", email);
  console.log("password: ", password);
  console.log("fullname: ", fullName);

  // Validate input fields
  if (
    [userName, email, fullName, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  console.log("ExistUser: ", existingUser);

  if (existingUser) {
    throw new ApiError(409, "User with Email or Username already exists ");
  }

  const avatarLocalath = req.files?.avatar?.[0]?.path; // Ensure correct field names are used
  console.log("Avatar File Path: ", avatarLocalath);
  const coverImageLocalath = req.files?.coverImage?.[0]?.path;

  // Check if files are uploaded correctly
  console.log("Uploaded files:", req.files);

  // Check if avatar file exists
  if (!avatarLocalath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload files to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalath);
  const coverImage = await uploadOnCloudinary(coverImageLocalath);

  // Check if the avatar was successfully uploaded
  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // Create the user entry in the database
  const user = await User.create({
    fullName,
    email,
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  // Fetch the created user to ensure success
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResonse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Destructure data from request body
  const { userName, email, password } = req.body;

  console.log("req.body: ", req.body);

  // Check if neither username nor email is provided
  if (!userName && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  // Find the user by username or email
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check if the password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  // Retrieve the logged-in user's details without sensitive fields
  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Send response with cookies and user information
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResonse(
        200,
        {
          user: loggedinUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResonse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  console.log(incomingRefreshToken);

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRATE
    );
    console.log(decodedToken);

    const user = User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResonse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { userRegister, loginUser, logoutUser, refreshAccessToken };

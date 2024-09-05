// user.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResonse } from "../utils/ApiResponse.js";

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

export { userRegister };

import { Router } from "express";
import {
  loginUser,
  logoutUser,
  userRegister,
  refreshAccessToken,
} from "../controllers/user.Controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  userRegister
);

userRouter.route("/login").post(loginUser);

// Sercured route

userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/refresh-token").post(refreshAccessToken);

export default userRouter;

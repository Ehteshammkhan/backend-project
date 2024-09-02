import { Router } from "express";
import { userRegister } from "../controllers/user.Controllers.js";

const userRouter = Router();

userRouter.route("/register").post(userRegister);

export default userRouter;

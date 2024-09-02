import { Router } from "express";
import { userRegister } from "../controllers/user.Controllers.js";

const router = Router();

router.route("/register").post(userRegister);

export default router;

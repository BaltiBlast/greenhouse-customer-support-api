import { Router } from "express";
import {
  getCurrentUserController,
  loginController,
  logoutController,
} from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.get("/me", getCurrentUserController);
authRouter.post("/logout", logoutController);

export default authRouter;

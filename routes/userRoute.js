import express from "express";
import { createUser, deleteUser, getUsers, loginUser, loginWithGoogle, resetPwd, sendOTP, updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login", loginUser)
userRouter.get("/",getUsers)
userRouter.put("/:id",updateUser)
userRouter.delete("/:id",deleteUser)
userRouter.post("/login/google",loginWithGoogle)
userRouter.post("/otp",sendOTP)
userRouter.post("/resetpwd",resetPwd)


export default userRouter;
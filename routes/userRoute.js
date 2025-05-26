import express from "express";
import { createUser, deleteUser, getUsers, loginUser, updateUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/",createUser)
userRouter.post("/login", loginUser)
userRouter.get("/",getUsers)
userRouter.put("/:id",updateUser)
userRouter.delete("/:id",deleteUser)


export default userRouter;
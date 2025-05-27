import express from "express";
import { addReview, deleteReview, getAllReview, getReviewById } from "../controllers/reviewController.js";


const reviewRouter=express.Router();

reviewRouter.post("/",addReview);
reviewRouter.get("/",getAllReview);
reviewRouter.get("/:productId",getReviewById);
reviewRouter.delete("/:productId",deleteReview);


export default reviewRouter;
import Product from "../models/product.js";
import Reviews from "../models/review.js";
import { isAdmin } from "./userController.js";

// Add a review (you already have this)
export async function addReview(req, res) {
    const review = new Reviews(req.body);

    try {
        await review.save();
        res.status(200).json({ message: "Thanks you for your review" });
    } catch (err) {
        res.status(400).json({ message: "Sorry, review submission failed" });
    }
}

// ✅ Get a review by ID

export async function getReviewById(req,res){
    const productId=req.params.productId

    try{
        const review=await Reviews.findOne({productId:productId})

        if(review==null){
            res.status(403).json({
                message:"Review not found"
            })
            return
        }else{
                res.status(200).json(review)
            }
       
    }catch(err){
        res.status(500).json({
            meggase:"Failed to search review",
            error:err
        })

    }

}

// ✅ Get all reviews (Admin only)
export async function getAllReview(req,res){

    try{
        if(isAdmin(req)){
            const review = await Reviews.find()
            res.json(review)
        }else{
            res.json({message:"You are not authorized"})
        }
        
    }catch(err){
        res.json({
            message: "Failed to get products",
            error: err
        })
    }
}


// ✅ Delete a review by ID (Admin only)
export async function deleteReview(req,res){
    
    if(!isAdmin(req)){
        res.status(403).json({
            message: "You are not authorized to delete a review"
        })
        return
    }
    try{
        await Reviews.deleteOne({productId : req.params.productId})

        res.json({
            message : "Review deleted successfully"
        })
    }catch(err){
        res.status(500).json({
            message : "Failed to delete review",
            error : err
        })
    }    
}

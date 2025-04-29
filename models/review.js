import mongoose from "mongoose";

const reviewSchema=mongoose.Schema({
    user: { 
        type: String,
        ref: req.user, 
        required: true },

    product: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true },

    rating: {
         type: Number, 
         required: true, 
         min: 1, 
         max: 5 },

    title: { type: String },
    comment: { type: String }
},  
{ timestamps: true }
)

const Review=mongoose.model("review",reviewSchema);
export default Review;
import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
    productId: {
        type: String,
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    user: {
        type:String,
        required: false, 
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        required:true,
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },



})

const Reviews = mongoose.model("review", reviewSchema);
export default Reviews;
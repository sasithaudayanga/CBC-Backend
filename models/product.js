import mongoose from "mongoose";

const productSchema = mongoose.Schema({
	productId : {
		type : String,
		required : true,
		unique : true
	},
	productName : {
		type : String,
		required : true
	},
	altNames : [
		{type : String}
	],
	productDescription : {
		type : String,
		required : true
	},
	images : [
		{type : String}
	],
	labelledPrice : {
		type : Number,
		required : true
	},
	price : {
		type : Number,
		required : true
	},
	stock : {
		type : Number,
		required : true
	},
	isAvailable : {
		type : Boolean,
		required : false,
		default : true
	},
});

const Product = mongoose.model("productlists", productSchema);

export default Product;

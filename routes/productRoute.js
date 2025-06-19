import express from "express";
import { deleteProduct, getProductById, getProducts, saveProduct, searchProduct, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getProducts);
productRouter.post("/", saveProduct);
productRouter.get("/search/:query",searchProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId",updateProduct);
productRouter.get("/:productId",getProductById);


export default productRouter;
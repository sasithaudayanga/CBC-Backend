import express from "express";
import { createOrder, getOrder, updateOrder } from "../controllers/orderController.js";

const orderRouter=express.Router()

orderRouter.post("/",createOrder)
orderRouter.get("/",getOrder)
orderRouter.put("/:orderId/:status",updateOrder)

export default orderRouter;
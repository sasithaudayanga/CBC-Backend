import Order from "../models/order.js"
import Product from "../models/product.js"
import User from "../models/user.js";
import { isAdmin } from "./userController.js"




export async function createOrder(req, res) {
    //get user information
    if (req.user == null) {
        res.status(403).json({
            message: "Please login first & try again"
        })
        return
    }
    //add current user name if not provided
    const orderInfo = req.body
    if (orderInfo.name == null) {
        orderInfo.name = req.user.firstName + " " + req.user.lastName
    }

    //orderId generate
    let orderId = "CBC00001"

    const lastOrder = await Order.find().sort({ date: -1 }).limit(1)

    if (lastOrder.length > 0) {

        const lastOrderId = lastOrder[0].orderId                     //"CBC00551"
        const lastOrderNumberString = lastOrderId.replace("CBC", "") //"00551"
        const lastOrderNumber = parseInt(lastOrderNumberString)     //551
        const newOrderNumber = lastOrderNumber + 1                //551
        const newOrderNumberString = String(newOrderNumber).padStart(5, '0')   //"00552"
        orderId = "CBC" + newOrderNumberString   //"CBC00552"
    }



    try {

        let total = 0;
        let labelledTotal = 0;
        const products = []

        for (let i = 0; i < orderInfo.products.length; i++) {
            const item = await Product.findOne({ productId: orderInfo.products[i].productId })

            if (item == null) {
                res.status(404).json({
                    message: "Product with productId " + orderInfo.products[i].productId + " not found"
                })
                return
            }

            if (item.isAvailable == false) {
                res.status(404).json({
                    message: "Product with productId " + orderInfo.products[i].productId + " not available right now"
                })
                return
            }

            products[i] = {
                productInfo: {
                    productId: item.productId,
                    name: item.productName,
                    altNames: item.altNames,
                    description: item.productDescription,
                    images: item.images,
                    labelledPrice: item.labelledPrice,
                    price: item.price
                },

                qty: orderInfo.products[i].qty

            }


            total += (item.price * orderInfo.products[i].qty)

            labelledTotal += (item.labelledPrice * orderInfo.products[i].qty)

        }

        const order = new Order({
            orderId: orderId,
            email: req.user.email,
            name: orderInfo.name,
            address: orderInfo.address,
            total: 0,
            phone: orderInfo.phone,
            products: products,
            labelledTotal: labelledTotal,
            total: total
        })

        const createdOrder = await order.save()
        res.status(200).json({
            message: "Order placed successfully",
            orderDetail: createdOrder

        })
    } catch (err) {

        res.status(500).json({
            message: "Failed to place order",
            error: err
        })
    }

}

export async function getOrder(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "Please login first & try again"
        })
        return
    }
    try {
        if (isAdmin) {
            const order = await Order.find();
            res.status(200).json(order);
        } else {
            const order = await Order.find({ email: req.user.email });
            res.status(200).json(order);
        }

    } catch (err) {
        res.status(500).json({
            message: "Faild to review order",
            error: err
        })
        return
    }


}

export async function updateOrder(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "You are not authorized to update a product"
        })
        return
    }

    const orderId = req.params.orderId;
    const status = req.params.status;

    try {

        await Order.updateOne({ orderId: orderId }, { status: status });

        res.status(200).json({message: "Order updated successfully"});

    } catch (err) {
        res.status(500).json({
            message: "Failed to update order",
            error: err,
        });
    }
}

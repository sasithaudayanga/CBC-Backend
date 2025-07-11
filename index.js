import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRoute.js';
import userRouter from './routes/userRoute.js';
import jwt from 'jsonwebtoken';
import orderRouter from './routes/orderRoute.js';
import cors from 'cors';
import dotenv from 'dotenv';
import reviewRouter from './routes/reviewRoute.js';

dotenv.config();

const app = express();

app.use(cors())
app.use(bodyParser.json())

app.use(
    (req, res, next) => {
        const tokenString = req.header("Authorization")
        if (tokenString != null) {
            const token = tokenString.replace("Bearer ", "")

            jwt.verify(token, process.env.JWT_KEY,
                (err, decoded) => {
                    if (decoded != null) {
                        req.user = decoded
                        next()
                    } else {
                        console.log("invalid token")
                        res.status(403).json({
                            message: "Invalid token"
                        })
                    }
                }
            )

        } else {
            next()
        }
    }
)

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Connected to the database")
    }).catch((err) => {
        console.log("Database connection failed")
        console.log(err)
    })




app.use("/api/products", productRouter)
app.use("/api/users", userRouter)
app.use("/api/orders",orderRouter)
app.use("/api/review",reviewRouter)


app.listen(3000,
    () => {
        console.log('Server is running on port 3000');
    }
)
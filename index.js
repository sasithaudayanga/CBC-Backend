import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRoute.js';
import userRouter from './routes/userRoute.js';
import jwt from 'jsonwebtoken';
const app = express();

app.use(bodyParser.json())

app.use(
    (req, res, next) => {
        const tokenString = req.header("Authorization")
        if (tokenString != null) {
            const token = tokenString.replace("Bearer ", "")

            jwt.verify(token, "cbc-batch-five#@2025",
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

mongoose.connect("mongodb+srv://admin:admin123@cluster2.0wlbw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2")
    .then(() => {
        console.log("Connected to the database")
    }).catch(() => {
        console.log("Database connection failed")
    })




app.use("/products", productRouter)
app.use("/users", userRouter)


app.listen(3000,
    () => {
        console.log('Server is running on port 3000');
    }
)
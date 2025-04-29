import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import userRouter from './routes/userRoute.js';


const app = express();

app.use(bodyParser.json())

app.use(
    (req, res, next) => {
        const tokenString = req.header("Authorization")
        if (tokenString != null) {
            const token = tokenString.replace("Bearer ", "")

            jwt.verify(token, "emsppsc2025",
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

app.use("/users",userRouter)

mongoose.connect("mongodb+srv://admin:ppscsgadmin9@ems-ppsc-sg.eztx0qb.mongodb.net/?retryWrites=true&w=majority&appName=EMS-PPSC-SG")
    .then(() => {
        console.log("Connected to the database")
    }).catch(() => {
        console.log("Database connection failed")
    })







app.listen(3000,
    () => {
        console.log('Server is running on port 3000');
    }
)
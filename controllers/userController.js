import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();


export function createUser(req,res){
    if(req.body.role == "admin"){
        if(req.user!= null){
            if(req.user.role != "admin"){
                res.status(403).json({
                    message : "You are not authorized to create an admin accounts"
                })
                return
            }
        }else{
            res.status(403).json({
                message : "You are not authorized to create an admin accounts. Please login first"
            })
            
            return
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    const user = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        password : hashedPassword,
        role : req.body.role,
    })


    user.save().then(
        ()=>{
            res.json({
                message : "User created successfully"
            })
        }
    ).catch(
        ()=>{
            res.json({
                message : "Failed to create user"
            })
        }
    )
}

export function loginUser(req,res){
    const email = req.body.email
    const password = req.body.password

    User.findOne({email : email}).then(
        (user)=>{
            if(user == null){
                res.status(404).json({
                    message : "User not found"
                })
            }else{
                const isPasswordCorrect = bcrypt.compareSync(password , user.password)
                if(isPasswordCorrect){
                    const token = jwt.sign(
                        {
                            email : user.email,
                            firstName : user.firstName,
                            lastName : user.lastName,
                            role : user.role,
                            img : user.img
                        },
                        process.env.JWT_KEY
                    )


                    res.json({
                        message : "Login successful",
                        token : token,
                        role:user.role
                    })

                }else{
                    res.status(401).json({
                        message : "Invalid password"
                    })
                }
            }

        }
    )
    
}



export async function getUsers(req, res) {
    try{
        if(isAdmin(req)){
            const users = await User.find()
            res.json(users)
            
        }else{
          res.status(400).json("Please Login First")
            return
            
        }
        
    }catch(err){
        res.json({
            message: "Internal error",
            error: err
        })
    }
}



export async function updateUser(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to update users"
        });
    }

    const userId = req.params.id;

    try {
        const updatedFields = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            role: req.body.role,
            status:req.body.isBlocked
        };

        
        if (req.body.password) {
            updatedFields.password = bcrypt.hashSync(req.body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update user",
            error: err.message,
        });
    }
}


export async function deleteUser(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized to delete users"
        });
    }

    const userId = req.params.id;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User deleted successfully",
            user: deletedUser,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete user",
            error: err.message,
        });
    }
}


export function isAdmin(req){
    if(req.user == null){
        return false
    }
    if(req.user.role != "admin"){
        return false
    }
    return true
}
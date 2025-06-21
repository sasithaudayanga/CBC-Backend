import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";

dotenv.config();


export async function createUser(req, res) {
    const email = req.body.email;
    User.findOne({ email: email }).then(
        (user) => {
            if (user == null) {

                if (req.body.role === "admin") {
                    if (!req.user || req.user.role !== "admin") {
                        return res.status(403).json({
                            message: "You are not authorized to create an admin account"
                        });
                    }
                }

                const hashedPassword = bcrypt.hashSync(req.body.password, 10);

                // Create new user
                const user = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: hashedPassword,
                    role: req.body.role,
                });

                user.save();

                //Delete previous OTP
                OTP.deleteMany({
                    email: email
                });


                // Generate new OTP
                const verifyOTP = Math.floor(100000 + Math.random() * 900000);


                // Save OTP in DB
                const verifyotp = new OTP({ email, otp: verifyOTP });
                verifyotp.save();

                // Email message
                const message = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "🔐 CBC Email Verification - Code Inside",
                    text: `Your email verification code is: ${verifyOTP}`,
                    html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2 style="color: #10b981;">Email Verification</h2>
                  <p>Hello,</p>
                  <p>You recently requested to register with CBC account. Use the code below to verify your email.</p>
                  <h3 style="font-size: 28px; color: #111; letter-spacing: 4px;">${verifyOTP}</h3>
                  <p>This code is valid for a limited time and can be used only once.</p>
                  <p>If you did not request this, you can safely ignore this email.</p>
                  <br />
                  <p style="color: #888;">Thank you,<br/>CBC Team</p>
                </div>
            `,
                };

                // Send email
                transport.sendMail(message, (error, info) => {
                    if (error) {
                        return res.status(500).json({
                            message: "Failed to send verification email",
                            error: error.toString(),
                        });
                    }

                    return res.status(200).json({
                        message: "User created. Verification code sent to your email.",

                    });
                });
            } else {
                res.status(409).json({ message: "User account with this email already exists" });

            }

        }
    )

}

export async function emailVerification(req, res) {
    const otp = req.body.otp;
    const email = req.body.email;
    //console.log(req.body);

    //find sent OTP
    const checkOTP = await OTP.findOne({
        email: email
    });

    if (checkOTP == null) {
        res.status(404).json({
            message: "Invalid verification code"
        });
        return;
    };

    if (otp == checkOTP.otp) {
        //delete all otp 
        await OTP.deleteMany({
            email: email
        });


        const verify = await User.updateOne({ email: email }, { emailVerified: "true" });
        res.status(200).json({
            message: "Email has been verified successfully."
        });

    } else {
        res.status(404).json({
            message: "Invalid verification code"
        });
        return;
    }
}


export async function loginUser(req, res) {
    const email = req.body.email
    const password = req.body.password

   try {
        const user = await User.findOne({ email });

        if (user==null) {
            return res.status(404).json({
                message: "You are not a registered user. Please sign up."
            });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

     /* if (user.emailVerified==false) {
            return res.status(403).json({
                message: "Please verify your email",
                verification: user.emailVerified,
                role: user.role
            });
        }*/

        const token = jwt.sign({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified,
            img: user.img
        }, process.env.JWT_KEY);

        return res.json({
            message: "Login successful",
            token: token,
            verification: user.emailVerified,
            role: user.role
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export async function getUsers(req, res) {
    try {
        if (isAdmin(req)) {
            const users = await User.find()
            res.json(users)

        } else {
            res.status(400).json("Please Login First")
            return

        }

    } catch (err) {
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
            status: req.body.isBlocked
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

export async function loginWithGoogle(req, res) {
    const token = req.body.accessToken;


    if (token == null) {
        res.status(400).json({
            message: "Access token is required"
        });
        return;
    }
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {

        headers: {
            Authorization: `Bearer ${token}`

        }

    });
    //console.log(response.data);

    const user = await User.findOne({ email: response.data.email });
    if (user == null) {

        const newUser = new User({
            email: response.data.email,
            firstName: response.data.given_name,
            lastName: response.data.family_name,
            img: response.data.picture,
            password: "google",
            email_verified: response.data.email_verified


        })
        await newUser.save();
        const token = jwt.sign(
            {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                img: newUser.img

            }, process.env.JWT_KEY
        )
        res.json({
            message: "login Sucessfll",
            token: token,
            role: newUser.role
        })

    } else {
        const token = jwt.sign(
            {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                img: user.img
            },
            process.env.JWT_KEY
        )


        res.json({
            message: "Login successful",
            token: token,
            role: user.role
        })


    }


}

const transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'stamp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    }
})

export async function sendOTP(req, res) {
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    const email = req.body.email;

    if (email == null) {
        res.status(400).json({
            message: "Please enter your Email"
        });
        return;
    }

    const user = await User.findOne({ email: email });

    if (user == null) {
        res.status(403).json({
            message: "Invalid email"
        });
        return;
    }

    //Dell all previous OTP
    await OTP.deleteMany({
        email: email
    });


    const message = {
        from: process.env.EMAIL,
        to: email,
        subject: "🔐 CBC Password Reset - OTP Inside",
        text: `Your password reset OTP is: ${randomOTP}`,
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #10b981;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You recently requested to reset your password for your CBC account. Use the OTP below to proceed:</p>
          <h3 style="font-size: 28px; color: #111; letter-spacing: 4px;">${randomOTP}</h3>
          <p>This OTP is valid for a limited time and can be used only once.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <br />
          <p style="color: #888;">Thank you,<br/>CBC Team</p>
        </div>
      `,
    };

    const otp = new OTP({
        email: email,
        otp: randomOTP
    })
    await otp.save();
    transport.sendMail(message,
        (error, infor) => {
            if (error) {
                res.status(500).json({
                    message: "Failed to sent OTP",
                    error: error
                })
            } else {
                res.status(200).json({
                    message: "OTP sent successfully",
                    // otp:randomOTP
                })
            }
        }
    )

}

export async function resetPwd(req, res) {
    const otp = req.body.otp;
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    //console.log(req.body);

    //find sent OTP
    const checkOTP = await OTP.findOne({
        email: email
    });

    if (checkOTP == null) {
        res.status(404).json({
            message: "Invalid OTP"
        });
        return;
    };

    if (otp == checkOTP.otp) {
        //delete all otp 
        await OTP.deleteMany({
            email: email
        });

        const newHashedPassword = bcrypt.hashSync(newPassword, 10);

        const resetpass = await User.updateOne({ email: email }, { password: newHashedPassword });
        res.status(200).json({
            message: "Password has been reset successfully"
        });

    } else {
        res.status(404).json({
            message: "Invalid OTP"
        });
        return;
    }
}

export function getUserAdmin(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message: "You are not authorized "
        });
        return;
    } else {
        res.json({
            ...req.user
        })
    }
}


export function isAdmin(req) {
    if (req.user == null) {
        return false
    }
    if (req.user.role != "admin") {
        return false
    }
    return true
}
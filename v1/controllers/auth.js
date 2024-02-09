import User from "../models/User.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import {AddToBlackList} from "../external_function/redisLogout/addToBlackList.js"
import jwt from "jsonwebtoken";

// const crypto = require("crypto")

export async function LoginwithOtp(req, res) {
    // Get variables for the login process
    // const { email } = req.body;
    const phone_number = req.body.phone_number
    const inpt_otp = req.body.otp
    var redirect_url = req.body.redirect_url
    
    if (redirect_url == null || redirect_url == undefined || redirect_url == "") {
        redirect_url = "/"
    }

    try {
        // Check if user exists
        const user = await User.findOne({ phone_number }).select("+otp");
        console.log("WORKING")
        if (!user){
            return res.status(501).json({
                message: "Wrong credential, plese try again",
            });
        }
        // if user exists
        // validate password
        const isOtpValid =  inpt_otp.toString() == user.otp.toString() ? true : false


        // if not valid, return unathorized response
        if (!isOtpValid)
            return res.status(501).json({
                data: [],
                message:
                    "Invalid OTP. Please try again with the correct credentials."
                });
        let options = {
            maxAge: 20 * 60 * 1000, // would expire in 20minutes
            httpOnly: true, // The cookie is only accessible by the web server
            secure: true,
            sameSite: "None",
        };
        const token = user.generateAccessJWTOtp(); // generate session token for user
        res.cookie("SessionID", token, options); // set the token to response header, so that the client sends it back on each subsequent request
        res.status(200).json({
            redirect_url: redirect_url,
            status: "success",
            message: "You have successfully logged in.",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function onBoard(req, res) {

    console.log("onBoard")
    // const length = 6
    const phone_number = req.body.phone_number.toString()
    var redirect_url = req.body.redirect_url

    if (redirect_url == null || redirect_url == undefined || redirect_url == "") {
        redirect_url = "/"
    }

    try {
        const user = await User.findOne({ phone_number }).select("+otp");
        if (!user){

            const otp = generateOTP(6);
            console.log("OTP :--- " + otp)
            const newUser = new User({
                phone_number : phone_number.toString(),
                otp : otp.toString(), 
                email : ""
            });
            console.log(newUser)
            const savedUser = await newUser.save() // save new user into the database
            console.log("Working")
            res.status(200).json({
                redirect_url : redirect_url,
                message: "Otp has been sent successfully",
            });
        }
        else{
            const otp = generateOTP(6);
            console.log("OTP :--- " + otp);

            user.otp = otp; // Update the existing user's OTP
            const updatedUser = await user.save(); // Save the updated user
            console.log('User updated:', updatedUser);
            res.status(200).json({
                redirect_url : redirect_url,
                message: "Otp has been sent successfully",
            });
        }

    }catch (e) {
        console.log(e.message)
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

function generateOTP(length) {
    const charset = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        otp += charset[randomIndex];
    }

    return parseInt(otp, 10);
}

export async function Logout(req, res) {

    const phone_number = req.body.phone_number
    try {
        const authHeader = req.headers["cookie"]; // get the session cookie from request header
        if (!authHeader) return res.sendStatus(401); // if there is no cookie from request header, send an unauthorized response.
        const cookie = authHeader.split("=")[1];
        jwt.verify(cookie, process.env.SECRET_ACCESS_TOKEN , async (err, decoded) => {
            if (err) {
                return res
                    .status(501)
                    .json({ message: err.message});
            }

            const { id } = decoded; // get user id from the decoded token
            AddToBlackList(cookie, id)
            res.status(200).json({
                redirect_url : "/",
                data: [],
                message: "Logout successfuly :)",
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
    res.end();
}
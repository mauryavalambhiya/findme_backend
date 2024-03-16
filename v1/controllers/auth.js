import User from "../models/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AddToBlackList } from "../external_function/redisLogout/addToBlackList.js";
import jwt from "jsonwebtoken";
// import {getRefreshToken} from "../config/getRefreshToken.js"
import getRefreshToken from "../config/getRefreshToken.js";
import mongoose from "mongoose";
import getAccessToken from "../config/getAccessToken.js";

// const crypto = require("crypto")

export async function LoginwithOtp(req, res) {
  // Get variables for the login process
  // const { email } = req.body;
  const phone_number = req.body.phone_number;
  const input_otp = req.body.otp;
  var redirect_url = req.body.redirect_url;

  if (redirect_url == null || redirect_url == undefined || redirect_url == "") {
    redirect_url = "/";
  }

  try {
    // Check if user exists
    var user = await User.findOne({ phone_number }).select("+otp");
    console.log("WORKING");
    if (!user) {
      return res.status(501).json({
        message: "Wrong credential, please try again",
      });
    }
    // if user exists
    // validate password
    const isOtpValid =
      input_otp.toString() == user.otp.toString() ? true : false;

    // if not valid, return unathorized response
    if (!isOtpValid)
      return res.status(501).json({
        data: [],
        message: "Invalid OTP. Please try again with the correct credentials.",
      });
    let options = {
      maxAge: 20 * 60 * 1000, // would expire in 20minutes
      httpOnly: true, // The cookie is only accessible by the web server
      secure: true,
      sameSite: "None",
    };
    const token = user.generateAccessJWTOtp(); // generate session token for user
    const refreshToken = jwt.sign(
      { user_phoneno: user.phone_number },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    console.log("refreshToken :- " + refreshToken + "\nAccess token :- " + token)
    var user_update = await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken: refreshToken }}
    )
    // user_update.refreshToken = refreshToken;
    // const result = await user_update.save();
    res.cookie("SessionID", token, options); // set the token to response header, so that the client sends it back on each subsequent request
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      role : user.role,  
      accessToken: token,
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
  console.log("onBoard");
  // const length = 6
  const phone_number = req.body.phone_number.toString();
  var redirect_url = req.body.redirect_url;

  if (redirect_url == null || redirect_url == undefined || redirect_url == "") {
    redirect_url = "/";
  }

  try {
    const user = await User.findOne({ phone_number }).select("+otp");
    if (!user) {
      const otp = generateOTP(6);
      console.log("OTP :--- " + otp);
      const newUser = new User({
        phone_number: phone_number.toString(),
        otp: otp.toString(),
        email: "",
      });
      console.log(newUser);
      const savedUser = await newUser.save(); // save new user into the database
      console.log("Working");
      res.status(200).json({
        redirect_url: redirect_url,
        message: "Otp has been sent successfully",
      });
    } else {
      const otp = generateOTP(6);
      console.log("OTP :--- " + otp);

      user.otp = otp; // Update the existing user's OTP
      const updatedUser = await user.save(); // Save the updated user
      console.log("User updated:", updatedUser);
      res.status(200).json({
        redirect_url: redirect_url,
        message: "Otp has been sent successfully",
      });
    }
  } catch (e) {
    console.log(e.message);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
}

export async function HandleRefreshToken(req, res) {
  const origin = req.headers["origin_private"];
  if (origin == process.env.ORIGIN_PRIVATE) {
    console.log("Ready");
    // const cookies = req.cookies;
    // if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = getRefreshToken(req);
    if (!refreshToken) {
      return res.status(400).json({
        massage: "refresh token not available in request",
      }); //refresh token not available in request
    } else {
      console.log("refreshToken :---- " + refreshToken);

      const foundUser = await User.findOne({
        refreshToken: refreshToken,
      }).exec();
      if (!foundUser) return res.status(403).json({
        massage: `no user found with refresh token: ${refreshToken}`
      }); //Forbidden
      // evaluate jwt
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err || (foundUser.phone_number !== decoded.user_phoneno))
            return res.status(403).json({massage : `${foundUser.phone_number} !== ${decoded.user_phoneno} error:- ${err.toString()} `});
          // const roles = Object.values(foundUser.roles);
          const token = foundUser.generateAccessJWTOtp();
          let options = {
            maxAge: 20 * 60 * 1000, // would expire in 20minutes
            httpOnly: true, // The cookie is only accessible by the web server
            secure: true,
            sameSite: "None",
          };

          res.cookie("SessionID", token, options); // set the token to response header, so that the client sends it back on each subsequent request
          res.status(200).json({
            role : foundUser.role ,
            accessToken: token,
            // redirect_url: redirect_url,
            status: "success",
            message: "You have successfully logged in agin.",
          });
          // res.json({token })
        }
      );
    }
  } else {
    res.status(503).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
}

function generateOTP(length) {
  const charset = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    otp += charset[randomIndex];
  }

  return parseInt(otp, 10);
}

export async function Logout(req, res) {
  const phone_number = req.body.phone_number;
  try {
    const refreshToken = getRefreshToken(req);
    const cookie = getAccessToken(req);
    console.log("FROM LOGOUT")
    if (!refreshToken) return res.status(403).json({massage : "Refresh token not available"})
    if (!cookie) return res.status(403).json({massage : "access token not available"})
    jwt.verify(
        cookie,
        process.env.SECRET_ACCESS_TOKEN,
        async (err, decoded) => {
          if (err) {
            return res.status(501).json({ message: err.message });
          } else {
            const { id } = decoded; // get user id from the decoded token
            AddToBlackList(cookie, id);
            // AddToBlackList(refreshToken, id)
            var foundUser = await User.findOne({ refreshToken }).exec();
            if (!foundUser) {
              res.clearCookie("jwt", {
                httpOnly: true,
                sameSite: "None",
                secure: true,
              });
              console.log("Responce sent ");
              return res.sendStatus(204);
            }
            foundUser.refreshToken = "";
            const result = await foundUser.save();
            console.log("foundUser :-  " + "OKKKK");
            res.clearCookie("jwt", {
              httpOnly: true,
              sameSite: "None",
              secure: true,
            });
            res.clearCookie("SessionID", {
              httpOnly: true,
              sameSite: "None",
              secure: true,
            });
            return res.status(200).json({
              redirect_url: "/",
              data: [],
              message: "Logout successfuly :)",
            });
          }
        }
      );
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
}

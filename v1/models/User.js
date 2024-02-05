import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { SECRET_ACCESS_TOKEN } from '../config/config.js';

const UserSchema = new mongoose.Schema(
    {
        user_name: {
            type: String,
            // required: "Your first name required",
            required: false,
            max: 255,
        },
        first_name: {
            type: String,
            // required: "Your first name required",
            required: false,
            max: 255,
        },
        last_name: {
            type: String,
            // required: "Your last name required",
            required: false,
            max: 255,
        },
        phone_number: {
            type: String,
            min: 10,
            required: "Your phone number is required",
            max: 10,
            required: true,
            default: "9999999999"
        },
        profile_image : {
            type: String,
            default: "_",
            required: false,
        },
        email: {
            type: String,
            // required: "Your email is required",
            required: false,
            lowercase: true,
            trim: true,
            
        },
        password: {
            type: String,
            // required: "Your password is required",
            required: false,
            select: false,
            max: 25,
        },
        otp: {
            type: String,
            // required: "Your password is required",
            required: false,
            select: false,
            max: 5,
        },
        role: {
            type: String,
            required: true,
            default: "0x01",
        },
    },
    {
        timestamps: true
    }
);

// "0x01" = simple user
// "0x88" = 
// UserSchema.pre("save", async function (next) {
//     const user = this;

//     if (!user.isModified("password") || !user.password) {
//         return next();
//     }

//     bcrypt.genSalt(10, (err, salt) => {
//         if (err) return next(err);

//         bcrypt.hash(user.password, salt, (err, hash) => {
//             if (err) return next(err);

//             user.password = hash;
//             // user.salt = salt;
//             next();
//         });
//     });
// });

// UserSchema.methods.generateAccessJWT = function () {
//     let payload = {
//         id: this._id,
//         email : this.email,
//         role : this.role
//     };
//     return jwt.sign(payload, SECRET_ACCESS_TOKEN, {
//         expiresIn: '20m',
//     });
// };

UserSchema.methods.generateAccessJWTOtp = function () {
    let payload = {
        id: this._id,
        email : this.email,
        phone_number : this.phone_number,
        role : this.role
    };
    return jwt.sign(payload, SECRET_ACCESS_TOKEN, {
        expiresIn: '20m',
    });
};

export default mongoose.model("users", UserSchema);
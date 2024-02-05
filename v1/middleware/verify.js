import User from "../models/User.js";
import jwt from "jsonwebtoken";
import {ckeckBlackList} from "../external_function/redisLogout/blackListCheck.js"

export async function Verify(req, res, next) {
    try {
        const authHeader = req.headers["cookie"]; // get the session cookie from request header
        // console.log("Header :- " + authHeader)

        if (!authHeader) {   
            return res.sendStatus(401); 
        }// if there is no cookie from request header, send an unauthorized response.
        const cookie = authHeader.split("=")[1]; // If there is, split the cookie string to get the actual jwt
        // console.log("Cookie :- " , cookie);
        console.log();

        // Verify using jwt to see if token has been tampered with or if it has expired.
        // that's like checking the integrity of the cookie

        // jwt.verify(cookie, process.env.SECRET_ACCESS_TOKEN , async (err, decoded) => {
        //     console.log("Ready");

        //     if (err) {
        //         // if token has been altered or has expired, return an unauthorized error
        //         return res
        //             .status(401)
        //             .json({ message: err.message});
        //     }else{
        //         // const doesExist = await  ckeckBlackList(cookie)
        //         // console.log(doesExist)
        //         // if (doesExist) {
        //         //     return res
        //         //         .status(401)
        //         //         .json({ message: "Unauthorised to access"});
        //         // }
        //         // else{
        //         //     const { id } = decoded; // get user id from the decoded token
        //         //     const user = await User.findById(id); // find user by that `id`
        //         //     const { password, ...data } = user._doc; // return user object without the password
        //         //     req.user = data; // put the data object into req.user
        //         // }

        //         ckeckBlackList(cookie)
        //           .then(async (doesExist) => {
        //             console.log(doesExist);

        //             if (doesExist) {
        //               return res
        //                 .status(401)
        //                 .json({ message: "Unauthorized to access" });
        //             }else{
        //                 const { id } = decoded; // get user id from the decoded token
        //                     const user = await User.findById(id); // find user by that `id`
        //                     const { password, ...data } = user._doc; // return user object without the password
        //                     req.user = data; // put the data object into req.user
        //             }

        //             // Continue with the rest of your code
        //           })
        //           .catch((error) => {
        //             console.error("Error checking blacklist:", error);
        //             return res
        //               .status(500)
        //               .json({ message: "Internal Server Error" });
        //           });
        //     }
            
        //     next();
        // });

        jwt.verify(cookie, process.env.SECRET_ACCESS_TOKEN, async (err, decoded) => {
            console.log("Ready");
        
            if (err) {
                // if token has been altered or has expired, return an unauthorized error
                return res.status(401).json({ message: err.message });
            }
        
            try {
                const doesExist = await ckeckBlackList(cookie);
        
                if (doesExist) {
                    return res.status(401).json({ message: "Unauthorized to access" });
                } else {
                    const { id } = decoded;
                    const user = await User.findById(id);
        
                    if (!user) {
                        return res.status(401).json({ message: "User not found" });
                    }
        
                    const { password, ...data } = user._doc;
                    req.user = data;
                    next(); // Continue with the next middleware or route handler
                }
            } catch (error) {
                console.error("Error checking blacklist:", error);
                return res.status(500).json({ message: "Internal Server Error" });
            }
        });

        
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

export default Verify;
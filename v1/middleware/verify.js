import User from "../models/User.js";
import jwt from "jsonwebtoken";
import util from 'util'
import {ckeckBlackList as checkBlackList} from "../external_function/redisLogout/blackListCheck.js"
import getAccessToken  from "../config/getAccessToken.js";

export async function Verify(req, res, next) {
    const user_agent = req.headers['user-agent']
    // console.log("user-agent :- " + user_agent)
    
    const origin = req.headers["origin_private"]
    if (origin == process.env.ORIGIN_PRIVATE) {
        try {
            var authHeader = req.headers["cookie"];
            authHeader = authHeader.split(";")[0] // get the session cookie from request header
            // console.log("Header :- " + authHeader)
            
            if (!authHeader) {   
                return res.sendStatus(401); 
            }// if there is no cookie from request header, send an unauthorized response.
            const cookie = getAccessToken(req) // If there is, split the cookie string to get the actual jwt
            if (!cookie) return res.status(403).json({massage : "access token not available"})
            
            jwt.verify(cookie, process.env.SECRET_ACCESS_TOKEN, async (err, decoded) => {
                // console.log(util.inspect(req.headers, false, null, true /* enable colors */))
                if (err) {
                    // if token has been altered or has expired, return an unauthorized error
                    console.log("ERROR :-------- " + err)
                    return res.status(403).json({ message: err.message });
                }
            
                try {
                    const doesExist = await checkBlackList(cookie);
            
                    if (doesExist) {
                        return res.status(403).json({ message: "Unauthorized to access" });
                    } else {
                        const { id } = decoded;
                        const user = await User.findById(id);
            
                        if (!user) {
                            return res.status(403).json({ message: "User not found" });
                        }
                        
                        const { password, ...data } = user._doc;
                        req.user = data;
                        next(); // Continue with the next middleware or route handler
                    }
                } catch (error) {
                    // console.error("Error checking blacklist:", error);
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
    }else if(origin == process.env.ORIGIN_PUBLIC){
        const APIKEY = req.headers["API_KEY"]
        if (APIKEY == process.env.API_KEY_PUBLIC){
            next();
        }
        else{
            return res.status(503).json({
                status: "error",
                code: 500,
                data: [],
                message: "Wrong API Key",
            });
        }
    }
    else if(origin == process.env.ORIGIN_PUBLIC_NET){
        const APIKEY = req.headers["API_KEY"]
        if (APIKEY == process.env.API_KEY_PUBLIC_NET){
            next();
        }
        else{
            return res.status(503).json({
                status: "error",
                code: 500,
                data: [],
                message: "Wrong API Key",
            });
        }
    }
    else{
        return res.status(503).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

export default Verify;
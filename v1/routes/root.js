import express from "express"; // import the express module
import Auth from './auth.js';
import UserController from './user.js';
import ImageService from './image_services.js';
import Admin from './admin.js';
import Verify from "../middleware/verify.js";
import User from "../models/User.js"
import jwt from "jsonwebtoken";
import { mongoose, connectToDatabase } from "../external_function/mongo/mongo_connect.js";
import getAccessToken from "../config/getAccessToken.js";


const app = express(); // Create an app object

app.disable("x-powered-by"); // Reduce fingerprinting (optional)
app.get("/v1", (req, res) => {
    // home route with the get method and a handler
    try {
        res.status(200).json({
            status: "success",
            data: [],
            message: "Welcome to our API homepage!",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
});
app.get("/v1/user", Verify, async (req, res) => {
    const cookie = getAccessToken(req)
    const decoded = jwt.decode(cookie);
    const id = decoded.id;

    // initialize a session
    const session = await mongoose.startSession();
    //start transaction
    session.startTransaction();
    var result = ""
    try { 
        result  = await User.findOne({ _id: id }).session(session);
        // ... Additional transactional operations
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(501).json({
            status: "Error",
            message: error.message
        });
      } 
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
        status: "success",
        message: result,
    });
});

app.use('/v1/auth', Auth);
app.use('/v1/image-service', ImageService);
app.use('/v1/admin', Admin);
app.use('/v1/user', UserController);
export default app;
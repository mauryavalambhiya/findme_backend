import express from "express"; // import the express module
import Auth from './auth.js';
import ImageService from './image_services.js';
import Verify from "../middleware/verify.js";
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
app.get("/v1/user", Verify, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to the your Dashboard!",
    });
});

app.use('/v1/auth', Auth);
app.use('/v1/image-service', ImageService);
export default app;
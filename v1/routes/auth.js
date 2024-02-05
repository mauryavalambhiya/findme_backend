import express from "express";
import {onBoard, LoginwithOtp, Logout} from "../controllers/auth.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";

const router = express.Router();

// Register route -- POST request
router.post(
    "/onboard",
    check("phone_number")
        .notEmpty()
        .isLength({ min: 10, max : 10 })
        .withMessage("Enter correct phone number"),
    Validate,
    onBoard
);

router.post(
    "/login",
    check("phone_number")
        .notEmpty()
        .isLength({ min: 10, max : 10 })
        .withMessage("Enter correct phone number"),
    check("otp")
        .notEmpty()
        .withMessage("Enter otp"),
    Validate,
    LoginwithOtp
);

router.post(
    "/logout",
    Validate,
    Logout
);

export default router;
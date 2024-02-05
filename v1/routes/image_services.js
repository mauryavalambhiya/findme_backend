import express from "express";
import { ImgAuth } from "../controllers/image_services.js";

const router = express.Router();

router.get("/auth", ImgAuth);

export default router;

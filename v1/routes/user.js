import express from "express";

import Validate from "../middleware/validate.js";
import Verify from "../middleware/verify.js";
import { check } from "express-validator";
import {AddToFavorite , DeleteFromFevorite, RateShop} from "../controllers/user/user_action.js"

const router = express.Router();

router.post("/addfavorite",Verify,AddToFavorite);
router.post("/removefavorite",Verify, DeleteFromFevorite);
router.post("/rateus",Verify, RateShop);

export default router;

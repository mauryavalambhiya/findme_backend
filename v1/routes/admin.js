import express from "express";
import { StartFreeListing } from "../controllers/admin/StartFreeListing.js";
import { AddProfile } from "../controllers/admin/ProfileManagment.js";
import { EditProfile } from "../controllers/admin/ProfileManagment.js";
import { DeleteProfile } from "../controllers/admin/ProfileManagment.js";
import { GetProfiles } from "../controllers/admin/ProfileManagment.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";

const router = express.Router();

router.get("/startfreelisting", StartFreeListing);
router.post("/addprofile", AddProfile);
router.post("/editprofile", EditProfile);
router.post("/deleteprofile", DeleteProfile);
router.post("/getprofiles", GetProfiles);

export default router;

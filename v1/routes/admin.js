import express from "express";
import { StartFreeListing } from "../controllers/admin/StartFreeListing.js";
import { AddProfile } from "../controllers/admin/ProfileManagment.js";
import { EditProfile } from "../controllers/admin/ProfileManagment.js";
import { DeleteProfile } from "../controllers/admin/ProfileManagment.js";
import { GetProfiles } from "../controllers/admin/ProfileManagment.js";
import Validate from "../middleware/validate.js";
import Verify from "../middleware/verify.js";
import { check } from "express-validator";

const router = express.Router();

router.get("/startfreelisting",Verify,StartFreeListing);
router.post("/addprofile",Verify, AddProfile);
router.post("/editprofile",Verify, EditProfile);
router.post("/deleteprofile",Verify, DeleteProfile);
router.post("/getprofiles",Verify, GetProfiles);

export default router;

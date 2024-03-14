import express from "express";
import { StartFreeListing } from "../controllers/admin/StartFreeListing.js";
import { AddProfile, GetProfilesById } from "../controllers/admin/ProfileManagment.js";
import { EditProfile } from "../controllers/admin/ProfileManagment.js";
import { DeleteProfile } from "../controllers/admin/ProfileManagment.js";
import { GetProfiles } from "../controllers/admin/ProfileManagment.js";
import { AddProduct, GetProductById } from "../controllers/admin/ProductManagment.js";
import { EditProduct } from "../controllers/admin/ProductManagment.js";
import { DeleteProduct } from "../controllers/admin/ProductManagment.js";
import { GetProduct } from "../controllers/admin/ProductManagment.js";
import Validate from "../middleware/validate.js";
import Verify from "../middleware/verify.js";
import { check } from "express-validator";

const router = express.Router();

router.get("/startfreelisting",Verify,StartFreeListing);
router.post("/addprofile",Verify, AddProfile);
router.post("/editprofile",Verify, EditProfile);
router.post("/deleteprofile",Verify, DeleteProfile);
router.post("/getprofilesbyid",Verify, GetProfilesById);
router.post("/getprofiles",Verify, GetProfiles);
router.post("/addproduct",Verify, AddProduct);
router.post("/editproduct",Verify, EditProduct);
router.post("/deleteproduct",Verify, DeleteProduct);
router.post("/getproduct",Verify, GetProduct);
router.post("/getproductbyid",Verify, GetProductById);

export default router;

import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {getprofile  , getSuggestedUsers , updateUser} from "../controllers/user_contorller.js"
const router = express.Router();


router.get("/profile/:username" , protectRoute , getprofile)
router.get("/suggested",protectRoute, getSuggestedUsers)
router.post("/update",protectRoute,updateUser)

export default router;
import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {getprofile , followUnfollowUser , getSuggestedUsers , updateUser} from "../controllers/user_contorller.js"
const router = express.Router();

router.post("/follow/:id" , protectRoute , followUnfollowUser)
router.get("/profile/:username" , protectRoute , getprofile)
router.get("/suggested",protectRoute, getSuggestedUsers)
router.post("/update",protectRoute,updateUser)

export default router;
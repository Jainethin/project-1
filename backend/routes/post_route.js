import express from "express";
import protectRoute from "../middleware/protectRoute.js"
import {createPost ,deletePost , createComment ,likeUnlikePost, getAllPost ,getLikePost, getFollowingPost , getUserPost} from "../controllers/post_coltroller.js"
const router = express.Router();

router.post("/create",protectRoute,createPost);
router.post("/like/:id",protectRoute,likeUnlikePost);
router.post("/comment/:id",protectRoute,createComment);
router.delete("/:id",protectRoute,deletePost);
router.get("/all",protectRoute,getAllPost)
router.get("/like/:id",protectRoute,getLikePost)
router.get("/following" ,protectRoute,getFollowingPost)
router.get("/user/:username",protectRoute,getUserPost)

export default router;
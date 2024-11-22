import User from "../models/user_model.js";
import cloudinary from "cloudinary"
import Post from "../models/post_model.js"

export const createPost = async (req,res) => {
    try {
        const {text } = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();

        const user = await User.findOne({_id : userId})
        if(!user){
            return res.status(400).json({error : "user not found"})
        }

        if(!text && !img){
            return res.status(400).json({error : "nothing in post"})
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            user : userId,
            text : text,
            img : img
        })
        await newPost.save();
        res.status(200).json({message : "post successful",newPost})


    } catch (err) {
        console.log(`Error in user controller createpost: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}

export const deletePost = async (req,res) => {
    try {
        const {id} = req.params;
        const post = await Post.findOne({_id : id})
        if(!post){
            return res.status(400).json({error : "Post not found"})
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error : "illegal use of delete post.not your post"})
        }
        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
        await Post.findByIdAndDelete({_id : id})
       

        res.status(200).json({message : "post delete successful"})


    } catch (err) {
        console.log(`Error in user controller deletepost: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}

export const createComment = async (req,res) => {
    try {
        const {text}= req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if(!text){
            return res.status(400).json({error : "comments empty"});
        }
        const post = await Post.findOne({_id : postId});
        if(!post){
            return res.status(404).json({error : "Post not found"});
        }

        const comment = {
            user : userId,
            text : text
        }

        post.comments.push(comment);
        await post.save();
        

        res.status(200).json({message : "post comment successful",post})


    } catch (err) {
        console.log(`Error in user controller createcomment: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}

export const likeUnlikePost = async (req,res) => {
    try {
        const userId = req.user._id;
        const { id: postId} = req.params;
        const post = await Post.findOne({_id : postId})
        if(!post){
            return res.status(404).json({error : "Post not found"})
        }
        console.log(userId)
        const userLikePost = post.like.includes({_id : userId.toString()});
        if(userLikePost){
            // unlike
            await Post.updateOne({_id : postId} , {$pull : {likes : userId}})
            await User.updateOne({_id : userId},{$pull : {likedPost : postId}})
            res.status(200).json({message : "unlike done"});
        }
        else {
            // like
            post.likes.push(userId);
            User.likedPost.push(postId);
            await post.save();
            
            res.status(200).json({message : "like done"});
        }
    } catch (err) {
        console.log(`Error in user controller like: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}

export const getAllPost = async (req,res) => {
    try {
        
        const post = await Post.find().sort({createdAt : -1}).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select : ["-password","-email","-followers","-following"]
        })
        if(post.length === 0){
            return res.status(200).json([])
        }
        

        res.status(200).json({message : "post all successful",post})


    } catch (err) {
        console.log(`Error in user controller all post: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}

export const getLikePost = async (req,res) => {
    try {
        
        const userId = req.params.id;
        const user = await User.findOne({_id : userId})
        if(!user){
            return res.status(404).json({error : "user not found"})

        }
        const likedPost = await Post.find({_id : {$in : user.likedPost}}).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select : "-password"
        })

        res.status(200).json({message : "post all successful",likedPost})


    } catch (err) {
        console.log(`Error in user controller get like post: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}

export const getFollowingPost = async (req,res) => {
    try {
        
        const userId = req.user._id;
        const user = await User.findOne({_id : userId});
        if(!user){
            return res.status(404).json({error : "user not found"});

        }
        const following = user.following;
        const feedPosts = await Post.find({user : {$in : following}}).sort({createdAt : -1}).populate({
            path : "user",
            select : "-password"
        }).populate({
            path : "comments.user",
            select : "-password"
        })
        
        res.status(200).json({message : "post following successful",feedPosts})


    } catch (err) {
        console.log(`Error in user controller get following post: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}

export const getUserPost = async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username : username})
        console.log(user)
        if(!user){
            return res.status(404).json({error : "user not found"});
        }
        const posts = await Post.find({user : User._id})
                                .sort({createdAt : -1}).populate({
                                    path : "user",
                                    select : "-password"
                                }).populate({
                                    path : "comments.user",
                                    select : "-password"
                                })
        res.status(200).json({message : "user post success", posts})

    } catch (err) {
        console.log(`Error in user controller get user post: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}
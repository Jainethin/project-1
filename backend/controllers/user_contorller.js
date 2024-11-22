import Notification from "../models/notifications_model.js";
import User from "../models/user_model.js"
import bcrypt from "bcryptjs"
import cloudinary from "cloudinary"
export const getprofile = async (req , res ) =>{
    try {
        const {username} = req.params;
        console.log(username)
        const user = await User.findOne({username : username})
        if(!user){
            return res.status(400).json({error: "User not found"});

        }
        res.status(200).json(user)
    } catch (err) {
        console.log("Error in user controller")
        req.status(500).json({error: "internal server error"})
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        if(id.length !== 24){
            return res.status(400).json({error: "invalid length of id"})
        }
        
        // Correct findById usage
        const userToModify = await User.findById(id); 
        const currentUser = await User.findById(req.user._id);
    
        if (id === req.user._id) {
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }
    
        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found by user controller" });
        }
    
        const isFollowing = currentUser.following.includes(id);
    
        if (isFollowing) {
            // Correct findByIdAndUpdate usage
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            const newNotification = new Notification({
                type : "unfollow",
                from : req.user._id,
                to : userToModify._id
            })
            await newNotification.save();
            
            res.status(200).json({ message: "Unfollow success" });
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            const newNotification = new Notification({
                type : "follow",
                from : req.user._id,
                to : userToModify._id
            })
            await newNotification.save();

            res.status(200).json({ message: "Follow success" });
        }
    } catch (err) {
        console.log(`Error in user controller follow: ${err}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById({_id : userId}).select("-password");
        const users = await User.aggregate([
            {
                $match : {_id : {$ne : userId}}
            },
            {
                $sample : {size : 10}
            }
        ])
        let filteredUser = users.filter((user) => !userFollowedByMe.following.includes(user._id))
        let suggestedUser = filteredUser.slice(0,4);

        suggestedUser.forEach(user => (user.password = null))
        
        res.status(200).json(suggestedUser)

    } catch (err) {
        console.log(`Error in user controller suggestion: ${err}`);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateUser = async (req,res) => {
    try {
        const userId = req.user._id;
        const {username , fullName , email, currentPassword, newpassword ,bio } = req.body;
        let {profileImg, coverImg} = req.body;
        let user = await User.findById({_id : userId});
        if(!user){
            return res.status(400).json({error : "User not found"})

        }

        if(newpassword ^ currentPassword){
            return req.status(400).json({error : "Password missing"});
        }
        if(newpassword && currentPassword){
            const isCrtPass = await bcrypt.compare(currentPassword, user)
            if(!isCrtPass){
                return res.status(400).json({error : "incorrect password"})
            }
            if(newpassword.length <8){
                return res.status(400).json({error : "password length needed to be 8"})
            }
            const salt = await bcrypt.genSalt(5);
            user.password = await bcrypt.hash(newpassword , salt);
        }
        
        // // images 
        // if(profileImg){
        //     if(user.profileImg){
        //         await cloudinary.uploader.destory(user.profileImg.split("/").pop().split(".")[0]);
        //     }

        //     const uploadedResponse = await cloudinary.uploader.upload(profileImg)
        //     profileImg = uploadedResponse.secure_url;
        // }
        // if(coverImg){
        //     if(user.coverImg){
        //         await cloudinary.uploader.destory(user.coverImg.split("/").pop().split(".")[0]);
        //     }
        //     const uploadedResponse = await cloudinary.uploader.upload(coverImg)
        //     coverImg = uploadedResponse.secure_url;
        // }

        // others
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.username = username || user.username;

        user= await user.save();
        user.password = null;
        return res.status(200).json({message : "user updated"})

        
    } catch (err) {
        console.log(`Error in user controller update: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}
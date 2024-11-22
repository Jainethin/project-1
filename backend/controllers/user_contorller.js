
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
        const {username , email, currentPassword, newpassword ,bio } = req.body;
        
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
        
       
        // others
        
        user.email = email || user.email;
        
        user.username = username || user.username;

        user= await user.save();
        user.password = null;
        return res.status(200).json({message : "user updated"})

        
    } catch (err) {
        console.log(`Error in user controller update: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}
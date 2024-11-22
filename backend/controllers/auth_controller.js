import User from "../models/user_model.js"
import bcrypt from "bcryptjs"
import generateToken from "../utils/generateToken.js";

export const signup = async (req , res) => {
    try{
        //get all the details typed
        const {username, fullName , email , password} = req.body;

        //validating the email 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error : "invalid email format"})
        }

        //check for existing user
        const existingEmail = await User.findOne({email : email})
        const existingUser = await User.findOne({username : username})
        if(existingEmail || existingUser){
            return res.status(400).json({error : "already exists"})
        }

        //password validation
        if(password.length < 8){
            return res.status(400).json({error : "password length"})
        }

        // hashing the password
        const salt = await bcrypt.genSalt(5);
        const hashedPassword = await bcrypt.hash(password , salt)

        // creating new user
        const newUser = new User({
            username : username,
            fullName : fullName,
            email : email,
            password : hashedPassword
        })

        // saving the details of new user
        if(newUser){
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(200).json({
                _id : newUser.id,
                fullName : newUser.fullName,
                username : newUser.username,
                email : newUser.email,
                password : newUser.password,
            })
        }else {
            res.status(404).json({error : "invalid user Data"})
        }



    }catch(err){
        console.log(`Error in signup : ${err}`)
        res.status(500).json({error : "Internal Server Error"})
    }
}
export const login = async (req , res) => {
    try{
        const {username , password } = req.body;
        console.log(password)
        const user = await User.findOne({username : username})
        const isCrtPassword = await bcrypt.compare(password , user?.password || "")
        if(!user || !isCrtPassword){
            return res.status(400).json({error : "Invalid User name or Password"})
        }
        generateToken(user._id,res);
        res.status(200).json({
                _id : user.id,
                fullName : user.fullName,
                username : user.username,
                email : user.email,
                password : user.password,
        })

    }catch(err){
        console.log(`Error in login : ${err}`)
        res.status(500).json({error : "Internal server error"})
    }
}
export const logout = async (req , res) => {
    try{
        res.cookie("jwt" , "" , {maxAge : 0})
        res.status(200).json({message : "logout success"})
    }catch(err){
        console.log(`Error in logout : ${err}`)
        res.status(500).json({error : "Internal server error"})

    }
}

export const getMe = async(req, res) =>{
    try{
        const user = await User.findOne({_id : req.user._id}).select("-password")
        res.status(200).json(user);
    }catch(err){
        console.log(`Error in getme : ${err}`)
        res.status(500).json({error : "Internal server error"})
    
    }
    
}
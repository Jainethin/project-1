import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        minLength : 8
    },
    
    


},{
    timestamps : true
})

const User = mongoose.model("User" , UserSchema);
export default User;
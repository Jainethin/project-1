import mongoose from "mongoose";


const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("mongo DB connected")
    }catch (err){
        console.log(`Error in connecting Db : ${err}`)
        process.exit(1);
    }
}

export default connectDB;


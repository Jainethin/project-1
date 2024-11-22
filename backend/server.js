
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import cors from "cors"

import authRoute from "./routes/auth_route.js"
import userRoute from "./routes/user_route.js"

import connectdb from "./db/connectDB.js"



const app = express();
dotenv.config();
const PORT = process.env.PORT;



app.use(cors({
    origin : "http://localhost:3000",
    credentials : true
}))

app.use(express.urlencoded({
    extended : true
}))

app.use(express.json());

app.use(cookieParser());



app.use("/api/auth" , authRoute);
app.use("/api/users", userRoute);



app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`)
    connectdb();
})
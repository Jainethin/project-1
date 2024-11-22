import jwt from "jsonwebtoken";
import User from "../models/user_model.js";

const protectRoute = async (req, res, next) => {
    try {
        // Access the JWT from cookies
        const token = req.cookies.jwt; // Correct access

        if (!token) {
            return res.status(400).json({ error: "No token found" });
        }

        // Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Check the token with your secret key
        if (!decoded) {
            return res.status(400).json({ error: "Invalid token" });
        }

        // Find the user using the decoded JWT data
        const user = await User.findOne({ _id: decoded.userId }).select("-password"); // Corrected 'findOne'
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Attach the user object to the request
        req.user = user;
        next(); // Call the next middleware or route handler

    } catch (err) {
        console.log(`Error in protectRoute: ${err}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default protectRoute;

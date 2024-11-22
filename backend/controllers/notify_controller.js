import Notification from "../models/notifications_model.js";

export const getNotifications = async(req, res )=> {
    try {
        const userId = req.user._id;
        const notification = await Notification.find({to : userId}).populate({
            path : "from",
            select : "username profileImg"
        })
        await Notification.updateMany({to : userId},{read : true});
        res.status(200).json(notification)
        
    } catch (err) {
        console.log(`Error in user controller get notify: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}
export const deleteNotifications = async(req, res )=> {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({to : userId})
        res.status(200).json({message : "notify deleted"})
    } catch (err) {
        console.log(`Error in user controller delete notify: ${err}`);
        res.status(500).json({ error: "Internal server error" });  
    }
}
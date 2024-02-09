import User from "../../models/User.js";
import jwt from "jsonwebtoken";


// enable freelisting, initiat product_id_list, initiat profile_id_list
export async  function StartFreeListing(req, res) {
    const authHeader = req.headers["cookie"];
    const cookie = authHeader.split("=")[1];
    const decoded = jwt.decode(cookie);
    const id = decoded.id

    const user = await User.findOne({ _id :  id })
    if (user.freelisting_enable == false) {
        console.log("Not enabled")
        // await User.findOneAndUpdate({ _id :  id }, { $set: {freelisting_enable : true , product_id_list: [], profile_id_list : []}})
        const new_user = await User.updateOne({ _id :  id }, {freelisting_enable : true ,  product_id_list: [], profile_id_list : []})
        // user.save()
        return res.status(200).json({
            user : new_user
        })   
    }
    else {

        return res.status(200).json({
            massage : "Already enabled"
        })  
    }

 
}
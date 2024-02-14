import User from "../../models/User.js";
import Profile from "../../models/Profile.js";
import jwt from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";

export async function AddProfile(req, res) {
  const authHeader = req.headers["cookie"];
  const cookie = authHeader.split("=")[1];
  const decoded = jwt.decode(cookie);
  const id = decoded.id;
  var business_name = req.body.business_name.toString();
  var business_description = req.body.business_description.toString();
  const tegs_list  = req.body.tegs_list
  var business_address = req.body.business_address.toString();
  var business_number = req.body.business_number.toString();
  var business_image = req.body.business_image.toString();
  // var gps_location = req.body.gps_location
  var main_category = req.body.main_category.toString();
  var sub_category = req.body.sub_category.toString();

  const profile = new Profile({
    business_name: business_name,
    business_description: business_description,
    tegs_list:tegs_list,
    business_address: business_address,
    gps_location: {
      type: "Point",
      coordinates: [22.2873299, 70.7986046],
    },
    // to be use when frontend is ready
    // gps_location : {
    //     "type": "Point",
    //     "coordinates": [gps_location.coords.latitude,  gps_location.coords.longitude]
    // },
    main_category: main_category,
    sub_category: sub_category,
    business_number: business_number,
    product_id_list: [],
    user_id: id,
    business_image: business_image,
    // ratings : {
    //     type : Number,
    //     required : true,
    //     default : null
    // },

    // to be use when frontend is ready
    // open_time : {
    //     type : Number,
    //     required : false,
    //     default : 8.30
    // },
    // close_time : {
    //     type : Number,
    //     required : false,
    //     default : 20.30
    // }
  });
  const result = await profile.save();
  const isUpdated = await updateProfileIdList(id);
  return res.status(200).json({
    massage: result,
  });
}

export async function EditProfile(req, res) {
  const authHeader = req.headers["cookie"];
  const cookie = authHeader.split("=")[1];
  const decoded = jwt.decode(cookie);
  const id = decoded.id;
  var business_id = req.body.business_id.toString();
  var business_name = req.body.business_name.toString();
  var business_description = req.body.business_description.toString();
  var business_address = req.body.business_address.toString();
  var business_number = req.body.business_number.toString();
  var business_image = req.body.business_image.toString();
  const tegs_list  = req.body.tegs_list
  // var gps_location = req.body.gps_location
  var main_category = req.body.main_category.toString();
  var sub_category = req.body.sub_category.toString();

  var profile = Profile.findOne({ _id: business_id, user_id : id});
  if (profile != null) {
    const updated_profile = await Profile.updateOne(
      { _id: business_id },
      {
        business_name: business_name,
        business_description: business_description,
        tegs_list:tegs_list,
        business_address: business_address,
        gps_location: {
          type: "Point",
          coordinates: [22.2873299, 70.7986046],
        },
        // to be use when frontend is ready
        // gps_location : {
        //     "type": "Point",
        //     "coordinates": [gps_location.coords.latitude,  gps_location.coords.longitude]
        // },
        main_category: main_category,
        sub_category: sub_category,
        business_number: business_number,
        business_image: business_image,
        // ratings : {
        //     type : Number,
        //     required : true,
        //     default : null
        // },

        // to be use when frontend is ready
        // open_time : {
        //     type : Number,
        //     required : false,
        //     default : 8.30
        // },
        // close_time : {
        //     type : Number,
        //     required : false,
        //     default : 20.30
        // }
      }
    );
    await updateProfileIdList(id)
    return res.status(200).json({
      profile: updated_profile,
      massage : "Profile updated successfully"

    });
  }
  return res.status(200).json({
    massage: "Profile not exist",
  });
}

export async function DeleteProfile(req, res) {
  const authHeader = req.headers["cookie"];
  const cookie = authHeader.split("=")[1];
  const decoded = jwt.decode(cookie);
  const id = decoded.id;
  var business_id = req.body.business_id.toString();
  console.log(id)
  var profile = Profile.findOne({ _id: business_id, user_id : id});
  if (profile != null) {
    const deleted_profile = await profile.deleteOne();
    await updateProfileIdList(id)
    return res.status(200).json({
      profile: deleted_profile,
      massage : "Profile deleteed successfully"
    });
  }
  return res.status(200).json({
    massage: "Profile not exist",
  });
}

export async function GetProfiles(req, res) {
  const authHeader = req.headers["cookie"];
  const cookie = authHeader.split("=")[1];
  const decoded = jwt.decode(cookie);
  const id = decoded.id;

  let data = await Profile.find({user_id : id})
  return res.status(200).json({
          massage: data
        });
  // (err, profile) => {
  //   if (err) {
  //     return res.status(501).json({
  //       massage: "Error getting profile"
  //     });
  //   }else{  
  //     return res.status(200).json({
  //       massage: profile
  //     });
  //   }
  // }
}

async function updateProfileIdList(user_id){
  //   console.log("updateProfile");
  //   const enabledProfiles = await Profile.find({ user_id: user_id });
  //   const enabledProfileIds = enabledProfiles.map(profile => profile._id);
  //   console.log("enabledProfiles :- " + enabledProfiles)
  //   console.log("enabledProfileIds :- " + enabledProfileIds)
  //   const user = await User.findById({ user_id }).exec();
  //   user.profile_id_list = enabledProfileIds
  //   await user.save();
  // return true;

  console.log("updateProfile");
  const enabledProfiles = await Profile.find({ user_id: user_id,  });
  const enabledProfileIds = enabledProfiles.map(profile => profile._id);
  console.log("enabledProfiles :- ", enabledProfiles);
  console.log("enabledProfileIds :- ", enabledProfileIds);
  
  // Use findById without {}
  const user = await User.findById(user_id).exec();
  user.profile_id_list = enabledProfileIds;
  await user.save();
  return true;
}


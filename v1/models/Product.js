import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  product_name: {
    type: String,
    require: true,
    default: "",
  },
  product_disc: {
    type: String,
    require: true,
    default: "",
  },
  profile_id: {
    type : [mongoose.ObjectId],
    require: true,
    default : []
  },
  tegs_list: {
    type: [String],
    require: false,
    default: [],
  },
  product_image: {
    type: String,
    require: false,
    default: "",
  },
  user_id: {
    type : mongoose.ObjectId,
    require: true
  },
  gps_location : {
    type : { type: String },
    coordinates: [Number],
},
});

export default mongoose.model("products", ProductSchema);

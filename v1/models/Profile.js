import mongoose from "mongoose"
import CATEGORY from "../config/categories.js"

const ProfileSchema = new mongoose.Schema(
    {
        business_name : {
            type: String,
            required: true
        },
        business_description : {
            type: String,
            required: true,
            default : ""
        },
        business_image : {
            type: String,
            required: true
        },
        business_address : {
            type : String,
            required: true,
            default : ""
        },
        gps_location : {
            type : { type: String },
            coordinates: [Number],
        },
        main_category : {
            type: String,
            required : true,
            default : 'DailyNeeds'
        },
        sub_category : {
            type: String,
            required : true,
            default : 'Grocery'
        },
        business_number : {
            type : String,
            required : true,
            default : "9999999999"
        },
        product_id_list : {
            type : [mongoose.ObjectId],
            required : true,
            default : []
        },
        user_id : {
            type : mongoose.ObjectId,
            required : true,
        },
        ratings : {
            ratings_arr : {
                type : [Number],
                default : [],
                required : true,                
            },
            score : {type : Number, default : 0, required : true}
        },
        open_time : {
            type : Number,
            required : false,
            default : 8.30
        },
        close_time : {
            type : Number,
            required : false,
            default : 20.30
        },
        tegs_list: {
            type: [String],
            require: true,
            default: [],
        },
    },
    {
        timestamps: true
    }
)

export default mongoose.model("profiles", ProfileSchema);

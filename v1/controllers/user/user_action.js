import Profile from "../../models/Profile.js";
import Prodcts from "../../models/Product.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';
import getAccessToken from "../../config/getAccessToken.js"
import axios from 'axios'
import chalk from 'chalk';

// enable freelisting, initiat product_id_list, initiat profile_id_list
export async function AddToFavorite(req, res) {
  const cookie = getAccessToken(req)
  const decoded = jwt.decode(cookie);
  const id = decoded.id;
  const profile_id = req.body.profile_id;

  if (profile_id != null && profile_id != undefined) {
    var user = await User.findOne({ _id: id });
    if (user.favorites.includes(profile_id)) {
      return res.status(200).json({
        massage: "Already exist",
      });
    } else {
      user.favorites.push(profile_id);
      user.save();
      return res.status(200).json({
        massage: "Added to Favorites",
      });
    }
  }
  return res.status(501).json({
    massage: "Provide profileid",
  });
}

export async function DeleteFromFevorite(req, res) {
  const cookie = getAccessToken(req)
  const decoded = jwt.decode(cookie);
  const id = decoded.id;
  const profile_id = req.body.profile_id;

  if (profile_id != null && profile_id != undefined) {
    var user = await User.findOne({ _id: id });
    if (user.favorites.includes(profile_id)) {
      user.favorites.pop(profile_id);
      user.save();
      return res.status(200).json({
        massage: "Removed from Favorites",
      });
    } else {
      return res.status(200).json({
        massage: "Does not exist",
      });
    }
  }
  return res.status(501).json({
    massage: "Provide profileid",
  });
}

export async function RateShop(req, res) {
  const cookie = getAccessToken(req)
  const decoded = jwt.decode(cookie);
  const id = decoded.id;
  const profile_id = req.body.profile_id;
  const ratings = parseInt(req.body.ratings, 10);
  console.log("ratings :- " + ratings);
  if (!(ratings > 5 || ratings < 0)) {
    const profile = await Profile.findById(profile_id);
    if (profile != null) {
      var old_score = profile.ratings.score;
      var number_of_ratings = profile.ratings.ratings_arr.length;
      var sum_of_ratings_old = profile.ratings.ratings_arr.reduce(
        (acc, current) => acc + current,
        0
      );
      var sum_of_ratings_new = sum_of_ratings_old + ratings;
      if (sum_of_ratings_new == 0 || number_of_ratings == 0) {
        profile.ratings.ratings_arr.push(ratings);
        profile.ratings.score = ratings;
      } else {
        var new_score = sum_of_ratings_new / (number_of_ratings + 1);
        new_score = new_score.toFixed(2);
        profile.ratings.ratings_arr.push(ratings);
        profile.ratings.score = new_score;
      }

      console.log("number_of_ratings :- " + number_of_ratings);
      console.log("sum_of_ratings_old :- " + sum_of_ratings_old);
      console.log("sum_of_ratings_new :- " + sum_of_ratings_new);
      console.log("new_score :- " + new_score);

      await profile.save();
      // var sum_of_ratings_old = await Profile.aggregate([
      //   {
      //     $match: { _id: mongoose.Types.ObjectId(profile._id) }, // Match the document by its ID
      //   },
      //   {
      //     $project: {
      //       sum: { $sum: "$numbers" }, // Calculate the sum of the 'numbers' array
      //     },
      //   },
      // ]);

      const user = await User.findOne({ _id: id });
      return res.status(200).json({
        massage: "OK",
      });
    } else {
      return res.status(501).json({
        massage: "Provide valid parameters",
      });
    }
  } else {
    return res.status(501).json({
      massage: "Provide valid parameters",
    });
  }
}

export async function Search(req, res) {

  const query = req.body.search_query.toString()
  const gps_location = req.body.gps_location
  console.log("gps_location :- " + gps_location)
  await Profile.collection.createIndex({ gps_location: "2dsphere" });

  var data = {}
  let index_name = JSON.stringify({
  "agr": "product_name"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://ap-south-1.aws.data.mongodb-api.com/app/application-0-bmczq/endpoint/globalsearch?secret=secret',
  headers: { 
    'Content-Type': 'application/json', 
    'arg': query
  },
  data : index_name
};

try {
  const response = await axios.request(config);
  // console.log(JSON.stringify(response.data));
  data = response.data
  var profile_id_list = [];

  data.products_list.forEach((product) => {
    profile_id_list = profile_id_list.concat(product.profile_id);
    // console.log(product.profile_id)
  });
  data.profiles_list.forEach((profile) => {
    profile_id_list = profile_id_list.concat(profile._id);
  });
  const uniqueProfileIds = Array.from(new Set(profile_id_list));
  // console.log(uniqueProfileIds)

  const gps_location_poin = gps_location || [22.2873299, 70.7986046]

  const pipeline = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: gps_location_poin},
        distanceField: "distance",
        maxDistance: 15,
        spherical: true,
        key: "gps_location"
      }
    },
    {
      $match: {
        _id: { $in: uniqueProfileIds.map(id => new ObjectId(id)) }
      }
    }
  ];
  
  try {
    const results = await Profile.aggregate(pipeline);
    // console.log(results);
    // Handle the results as needed
    return res.status(200).json({
      profile_id_list: results,
    });
  } catch (error) {
    console.error(error);
    // Handle errors
    return res.status(501).json({
      error: error,
    });
  }

  // const profileSearchResult = await Profile.aggregate([
  //   {
  //     $search: {
  //       index: "profile_search",
  //       text: {
  //         query: "New",
  //         path: {
  //           wildcard: "*"
  //         },
  //         fuzzy: {}
  //       }
  //     }
  //   }
  // ]);

  // // const productSearchResult = await Product.aggregate([
  // //   {
  // //     $search: {
  // //       index: "product_search",
  // //       text: {
  // //         query: searchQuery,
  // //         path: {
  // //           wildcard: "*"
  // //         }
  // //       }
  // //     }
  // //   }
  // // ]);

  // return res.status(200).json({
  //   massage : "Search Success",
  //   data : profileSearchResult
  // });

} catch (error) {
  console.log(error);
  return res.status(501).json({
    massage : "Search Failure",
    error : error.message
  });
}

 
}

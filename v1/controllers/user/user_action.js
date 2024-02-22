import Profile from "../../models/Profile.js";
import Prodcts from "../../models/Product.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ObjectId } from 'mongodb';
import getAccessToken from "../../config/getAccessToken.js"
import axios from 'axios'

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
  // const gps_location = req.body.gps_location
  await Profile.collection.createIndex({ gps_location: "2dsphere" });

  // var data = {
  //   products_list: [
  //     {
  //       _id: "65c7706895c7ad6d1de4881d",
  //       product_name: "product_name",
  //       product_disc: "product_disc",
  //       profile_id: ["65c5b7dff9a741c87553c3e1", "65c5b7e1f9a741c87553c3e3"],
  //       tegs_list: ["Teg1", "Teg2"],
  //       product_image: "product_image",
  //       user_id: "65c576d5908b4737ba4f5245",
  //       gps_location: {
  //         coordinates: [],
  //       },
  //       __v: 0,
  //     },
  //     {
  //       _id: "65c776999a1aaaa5819f05ae",
  //       product_name: "product_name6",
  //       product_disc: "product_disc6",
  //       profile_id: ["65c5b7e1f9a741c87553c3e3", "65c5b7e2f9a741c87553c3e5"],
  //       tegs_list: ["Teg1", "Teg2"],
  //       product_image: "product_image",
  //       user_id: "65c576d5908b4737ba4f5245",
  //       gps_location: {
  //         coordinates: [],
  //       },
  //       __v: 0,
  //     },
  //     {
  //       _id: "65c776529a1aaaa5819f05a2",
  //       product_name: "product_name2",
  //       product_disc: "product_disc2",
  //       profile_id: ["65c5b7dff9a741c87553c3e1", "65c5b7e1f9a741c87553c3e3"],
  //       tegs_list: ["Teg1", "Teg2"],
  //       product_image: "product_image",
  //       user_id: "65c576d5908b4737ba4f5245",
  //       gps_location: {
  //         coordinates: [],
  //       },
  //       __v: 0,
  //     },
  //     {
  //       _id: "65c776849a1aaaa5819f05ab",
  //       product_name: "product_name5",
  //       product_disc: "product_disc5",
  //       profile_id: ["65c5b7dff9a741c87553c3e1", "65c5b7e2f9a741c87553c3e5"],
  //       tegs_list: ["Teg1", "Teg2"],
  //       product_image: "product_image",
  //       user_id: "65c576d5908b4737ba4f5245",
  //       gps_location: {
  //         coordinates: [],
  //       },
  //       __v: 0,
  //     },
  //     {
  //       _id: "65c776599a1aaaa5819f05a5",
  //       product_name: "product_name3",
  //       product_disc: "product_disc3",
  //       profile_id: ["65c5b7dff9a741c87553c3e1", "65c5b7e1f9a741c87553c3e3"],
  //       tegs_list: ["Teg1", "Teg2"],
  //       product_image: "product_image",
  //       user_id: "65c576d5908b4737ba4f5245",
  //       gps_location: {
  //         coordinates: [],
  //       },
  //       __v: 0,
  //     },
  //     {
  //       _id: "65c7767c9a1aaaa5819f05a8",
  //       product_name: "product_name4",
  //       product_disc: "product_disc4",
  //       profile_id: ["65c5b7dff9a741c87553c3e1", "65c5b7e2f9a741c87553c3e5"],
  //       tegs_list: ["Teg1", "Teg2"],
  //       product_image: "product_image",
  //       user_id: "65c576d5908b4737ba4f5245",
  //       gps_location: {
  //         coordinates: [],
  //       },
  //       __v: 0,
  //     },
  //     {
  //       _id: "65c776499a1aaaa5819f059f",
  //       product_name: "product_name1",
  //       product_disc: "product_disc1",
  //       profile_id: ["65c5b7dff9a741c87553c3e1", "65c5b7e1f9a741c87553c3e3"],
  //       tegs_list: ["Teg1", "Teg2"],
  //       product_image: "product_image",
  //       user_id: "65c576d5908b4737ba4f5245",
  //       gps_location: {
  //         coordinates: [],
  //       },
  //       __v: 0,
  //     },
  //     {
  //       _id: "65c776a49a1aaaa5819f05b1",
  //       product_name: "product_name7",
  //       product_disc: "product_disc7",
  //       profile_id: ["65c5b7e1f9a741c87553c3e3", "65c5b7e2f9a741c87553c3e5"],
  //       tegs_list: ["Teg1", "Teg2"],
  //       product_image: "product_image",
  //       user_id: "65c576d5908b4737ba4f5245",
  //       gps_location: {
  //         coordinates: [],
  //       },
  //       __v: 0,
  //     },
  //   ],
  //   profiles_list: [
  //     {
  //       _id: "65caf4377bfade203482c04a",
  //       business_name: "New Gangotri International School",
  //       business_image:
  //         "https://c8.alamy.com/comp/GA64KK/indian-shop-on-karl-marx-strasse-in-multicultural-district-of-neukolln-GA64KK.jpg",
  //       business_address: "New  Gondal Jetpur NH-27 Jamvadi,Gondal",
  //       gps_location: {
  //         type: "Point",
  //         coordinates: [22.2873299, 70.7986046],
  //       },
  //       main_category: "Education",
  //       sub_category: "School",
  //       business_number: "9723130309",
  //       product_id_list: [],
  //       user_id: "65c576d5908b4737ba4f5245",
  //       ratings: {
  //         ratings_arr: [],
  //         score: 0,
  //       },
  //       open_time: 8.3,
  //       close_time: 20.3,
  //       createdAt: "2024-02-13T04:46:47.424Z",
  //       updatedAt: "2024-02-13T04:46:47.424Z",
  //       __v: 0,
  //     },
  //     {
  //       _id: "65caf47aa4748e55eac2148c",
  //       business_name: "New Gangotri International School",
  //       business_image:
  //         "https://c8.alamy.com/comp/GA64KK/indian-shop-on-karl-marx-strasse-in-multicultural-district-of-neukolln-GA64KK.jpg",
  //       business_address: "New  Gondal Jetpur NH-27 Jamvadi,Gondal",
  //       gps_location: {
  //         type: "Point",
  //         coordinates: [22.2873299, 70.7986046],
  //       },
  //       main_category: "Education",
  //       sub_category: "School",
  //       business_number: "9723130309",
  //       product_id_list: [],
  //       user_id: "65c576d5908b4737ba4f5245",
  //       ratings: {
  //         ratings_arr: [],
  //         score: 0,
  //       },
  //       open_time: 8.3,
  //       close_time: 20.3,
  //       createdAt: "2024-02-13T04:47:54.65Z",
  //       updatedAt: "2024-02-13T04:47:54.65Z",
  //       __v: 0,
  //     },
  //     {
  //       _id: "65caf5639efb2a59f5657627",
  //       business_name: "New Gangotri International School",
  //       business_image:
  //         "https://c8.alamy.com/comp/GA64KK/indian-shop-on-karl-marx-strasse-in-multicultural-district-of-neukolln-GA64KK.jpg",
  //       business_address: "New  Gondal Jetpur NH-27 Jamvadi,Gondal",
  //       gps_location: {
  //         type: "Point",
  //         coordinates: [22.2873299, 70.7986046],
  //       },
  //       main_category: "Education",
  //       sub_category: "School",
  //       business_number: "9723130309",
  //       product_id_list: [],
  //       user_id: "65c576d5908b4737ba4f5245",
  //       ratings: {
  //         ratings_arr: [5, 5, 5],
  //         score: 5,
  //       },
  //       open_time: 8.3,
  //       close_time: 20.3,
  //       createdAt: "2024-02-13T04:51:47.989Z",
  //       updatedAt: "2024-02-13T05:08:55.007Z",
  //       __v: 11,
  //     },
  //     {
  //       _id: "65c5b7dff9a741c87553c3e1",
  //       business_name: "Gangotri International School Edit 1",
  //       business_image:
  //         "https://c8.alamy.com/comp/GA64KK/indian-shop-on-karl-marx-strasse-in-multicultural-district-of-neukolln-GA64KK.jpg",
  //       business_address: "Gondal Jetpur NH-27 Jamvadi,Gondal",
  //       gps_location: {
  //         type: "Point",
  //         coordinates: [22.2873299, 70.7986046],
  //       },
  //       main_category: "Education",
  //       sub_category: "School",
  //       business_number: "9723130309",
  //       product_id_list: [],
  //       user_id: "65c576d5908b4737ba4f5245",
  //       ratings: null,
  //       open_time: 8.3,
  //       close_time: 20.3,
  //       createdAt: "2024-02-09T05:27:59.649Z",
  //       updatedAt: "2024-02-12T21:34:56.139Z",
  //       __v: 9,
  //     },
  //     {
  //       _id: "65ca866f96c6771d27243cc5",
  //       business_name: "Gangotri International School",
  //       business_image:
  //         "https://c8.alamy.com/comp/GA64KK/indian-shop-on-karl-marx-strasse-in-multicultural-district-of-neukolln-GA64KK.jpg",
  //       business_address: "Gondal Jetpur NH-27 Jamvadi,Gondal",
  //       gps_location: {
  //         type: "Point",
  //         coordinates: [22.2873299, 70.7986046],
  //       },
  //       main_category: "Education",
  //       sub_category: "School",
  //       business_number: "9723130309",
  //       product_id_list: [],
  //       user_id: "65c576d5908b4737ba4f5245",
  //       ratings: null,
  //       open_time: 8.3,
  //       close_time: 20.3,
  //       createdAt: "2024-02-12T20:58:23.786Z",
  //       updatedAt: "2024-02-12T21:34:56.184Z",
  //       __v: 6,
  //     },
  //     {
  //       _id: "65c5b7e1f9a741c87553c3e3",
  //       business_name: "Gangotri International School",
  //       business_image:
  //         "https://c8.alamy.com/comp/GA64KK/indian-shop-on-karl-marx-strasse-in-multicultural-district-of-neukolln-GA64KK.jpg",
  //       business_address: "Gondal Jetpur NH-27 Jamvadi,Gondal",
  //       gps_location: {
  //         type: "Point",
  //         coordinates: [22.2873299, 70.7986046],
  //       },
  //       main_category: "Education",
  //       sub_category: "School",
  //       business_number: "9723130309",
  //       product_id_list: [],
  //       user_id: "65c576d5908b4737ba4f5245",
  //       ratings: null,
  //       open_time: 8.3,
  //       close_time: 20.3,
  //       createdAt: "2024-02-09T05:28:01.075Z",
  //       updatedAt: "2024-02-12T21:34:21.34Z",
  //       __v: 23,
  //     },
  //   ],
  // };

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
  console.log(JSON.stringify(response.data));
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
  console.log(uniqueProfileIds)
  const pipeline = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: [22.2873299, 70.7986046] },
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
    console.log(results);
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

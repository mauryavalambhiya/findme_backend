import Profile from "../../models/Profile.js";
import User from "../../models/User.js";
import jwt from "jsonwebtoken";

// enable freelisting, initiat product_id_list, initiat profile_id_list
export async function AddToFavorite(req, res) {
  const authHeader = req.headers["cookie"];
  const cookie = authHeader.split("=")[1];
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
  const authHeader = req.headers["cookie"];
  const cookie = authHeader.split("=")[1];
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
  const authHeader = req.headers["cookie"];
  const cookie = authHeader.split("=")[1];
  const decoded = jwt.decode(cookie);
  const id = decoded.id;
  const profile_id = req.body.profile_id;
  const ratings = parseInt(req.body.ratings, 10);
  console.log( "ratings :- " + ratings);
  if(!(ratings > 5 || ratings < 0)){
    const profile = await Profile.findById(profile_id);
    if(profile != null){
      var old_score = profile.ratings.score;
      var number_of_ratings = profile.ratings.ratings_arr.length;
      var sum_of_ratings_old =  profile.ratings.ratings_arr.reduce((acc, current) => acc + current, 0);
      var sum_of_ratings_new = sum_of_ratings_old + ratings
      if (sum_of_ratings_new == 0 || number_of_ratings == 0){
        profile.ratings.ratings_arr.push(ratings);
        profile.ratings.score = ratings; 
      }else{
        var new_score = sum_of_ratings_new / (number_of_ratings +1)
        new_score = new_score.toFixed(2);
        profile.ratings.ratings_arr.push(ratings);
        profile.ratings.score = new_score; 
      }


      console.log( "number_of_ratings :- " + number_of_ratings);
      console.log( "sum_of_ratings_old :- " + sum_of_ratings_old);
      console.log( "sum_of_ratings_new :- " + sum_of_ratings_new);
      console.log( "new_score :- " + new_score);


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
    }
    else{
      return res.status(501).json({
        massage: "Provide valid parameters",
      });
    }

  }else{
    return res.status(501).json({
      massage: "Provide valid parameters",
    });
  }

}

import User from '../../models/User.js'
import Profile from '../../models/Profile.js'
import Product from '../../models/Product.js'
import jwt from "jsonwebtoken";

export async function AddProduct(req, res){
    const authHeader = req.headers["cookie"];
    const cookie = authHeader.split("=")[1];
    const decoded = jwt.decode(cookie);
    const id = decoded.id;

    var product_name = req.body.product_name.toString();
    var product_disc = req.body.product_disc.toString();
    const profile_id_list = req.body.profile_id
    const tegs_list  = req.body.tegs_list
    const product_image = req.body.product_image.toString();
    const user_id = id

    const product = new Product({
        product_name: product_name,
        product_disc: product_disc,
        profile_id: profile_id_list,
        tegs_list: tegs_list,
        product_image: product_image,
        user_id: user_id
    })

    const result = await product.save();
    return res.status(200).json({
        massage: result,
    });
}

export async function EditProduct(req, res){
    const authHeader = req.headers["cookie"];
    const cookie = authHeader.split("=")[1];
    const decoded = jwt.decode(cookie);
    const id = decoded.id;

    var product_id = req.body.product_id.toString();
    var product_name = req.body.product_name.toString();
    var product_disc = req.body.product_disc.toString();
    const profile_id_list = req.body.profile_id
    const tegs_list  = req.body.tegs_list
    const product_image = req.body.product_image.toString();
    const user_id = id

    var product = await Product.findOne({_id : product_id, user_id : id});
    if (product == null) {
        return res.status(501).json({
            massage: "Product does not exist",
        });
    }else{
        try {
            const edited_product = await Product.updateOne({ _id: product_id },
                {
                    product_name: product_name,
                    product_disc: product_disc,
                    profile_id: profile_id_list,
                    tegs_list: tegs_list,
                    product_image: product_image,
                    user_id: user_id
            })
            return res.status(200).json({
                massage: edited_product,
            });
        }catch(e){
            return res.status(501).json({
                massage: e.massage,
            });
        }

    }

}

export async function DeleteProduct(req, res){
    const authHeader = req.headers["cookie"];
    const cookie = authHeader.split("=")[1];
    const decoded = jwt.decode(cookie);
    const id = decoded.id;
    var product_id = req.body.product_id.toString();
    console.log(id)
    var product = Product.findOne({ _id: product_id, user_id : id});
    if (product != null) {
      const deleted_product = await product.deleteOne();
      return res.status(200).json({
        product: deleted_product,
        massage : "Product deleteed successfully"
      });
    }
    return res.status(200).json({
      massage: "Profile not exist",
    });
}

export async function GetProduct(req, res){
    const authHeader = req.headers["cookie"];
    const cookie = authHeader.split("=")[1];
    const decoded = jwt.decode(cookie);
    const id = decoded.id;

    let data = await Product.find({user_id : id})
    return res.status(200).json({
          massage: data
        });
}





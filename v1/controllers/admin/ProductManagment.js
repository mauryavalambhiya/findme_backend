import User from '../../models/User.js'
import Profile from '../../models/Profile.js'
import Product from '../../models/Product.js'
import jwt from "jsonwebtoken";
import { mongoose, connectToDatabase } from "../../external_function/mongo/mongo_connect.js";



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

    const session = await mongoose.startSession();
    var result1 = ""
    const product = new Product({
        product_name: product_name,
        product_disc: product_disc,
        profile_id: profile_id_list,
        tegs_list: tegs_list,
        product_image: product_image,
        user_id: user_id
    })
    session.startTransaction();
    try{

        result1 = await product.save({ session: session });
        var docs = await Profile.find({ _id: { $in: profile_id_list }, user_id: user_id}).session(session);
        console.log("Result :- " + result1);
        console.log("DOC :- " + docs);
        if (!docs) {
            throw new Error('Document not found');
        }

        for (var i = 0; i < docs.length; i++) {
            console.log("Looping")
            var doc = docs[i];
            if (!doc.product_id_list.includes(result1._id)) {
                // Push the new product ID to the product list array
                doc.product_id_list.push(result1._id);
                await doc.save({ session: session });
            }
        }
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        return res.status(501).json({
            status: "Error",
            message: error.message
        });
    }
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
        massage: result1,
    });
}

export async function EditProduct(req, res){
    const authHeader = req.headers["cookie"];
    const cookie = authHeader.split("=")[1];
    const decoded = jwt.decode(cookie);
    const id = decoded.id;

    var result1 = ""
    var product_id = req.body.product_id.toString();
    var product_name = req.body.product_name.toString();
    var product_disc = req.body.product_disc.toString();
    const profile_id_list = req.body.profile_id
    const tegs_list  = req.body.tegs_list
    const product_image = req.body.product_image.toString();
    const user_id = id
    var old_profile_array = []
    var new_profile_array = []
    var arrayToBeDeleted = []
    var arrayToBeAdded = []

    var product = await Product.findOne({_id : product_id, user_id : id}).exec();
    if (product == null) {
        return res.status(501).json({
            massage: "Product does not exist",
        });
    }else{
        old_profile_array = product.profile_id
        new_profile_array = profile_id_list
        console.log("old_profile_array :- " + old_profile_array) 
        console.log("new_profile_array :- " + new_profile_array) 
        if(product.profile_id_list == profile_id_list){
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
        }else{
            const session = await mongoose.startSession();
            arrayToBeDeleted = getArrayToBeDeletedArr(old_profile_array,new_profile_array)
            arrayToBeAdded =   getArrayToBeAddedArr(old_profile_array,new_profile_array)
            console.log("arrayToBeDeleted :- " + arrayToBeDeleted) 
            console.log("arrayToBeAdded :- " + arrayToBeAdded) 
            session.startTransaction();
            try{
                const edited_product = await Product.updateOne({ _id: product_id },
                    {
                        product_name: product_name,
                        product_disc: product_disc,
                        profile_id: profile_id_list,
                        tegs_list: tegs_list,
                        product_image: product_image,
                        user_id: user_id
                }).session(session)

                result1 = edited_product
                // Add product to profile
                if(arrayToBeAdded.length <= 0) {
                    console.log("Nothing to be added.")
                }else{
                    var add_docs = await Profile.find({ _id: { $in: arrayToBeAdded }, user_id: user_id}).session(session);
                    console.log("Result :- " + result1);
                    console.log("DOC Add:- " + add_docs);
                    if (!add_docs) {
                        throw new Error('Document not found');
                    }
                    for (var i = 0; i < add_docs.length; i++) {
                        console.log("Looping - Add")
                        let doc = add_docs[i];
                        if (!doc.product_id_list.includes(product._id)) {
                            // Push the new product ID to the product list array
                            doc.product_id_list.push(product._id);
                            const new_doc = await doc.save({ session: session });
                            console.log(new_doc)
                        }
                    }
                }
                
                // Remove product to profile
                if(arrayToBeDeleted.length <= 0) {
                    //pass
                    console.log("Nothing to be removed.")
                }
                else{
                    var delete_docs = await Profile.find({ _id: { $in: arrayToBeDeleted }, user_id: user_id}).session(session);
                    console.log("Result :- " + result1);
                    console.log("DOC del:- " + delete_docs);
                    if (!delete_docs) {
                        throw new Error('Document not found');
                    }
                    for (var i = 0; i < delete_docs.length; i++) {
                        console.log("Looping -delete")
                        let doc = delete_docs[i];
                        if(doc.product_id_list.length == 1 && doc.product_id_list.includes(product._id)){
                            doc.product_id_list = []
                            const new_doc = await doc.save({ session: session });
                            console.log(new_doc)
                        }else{
                            if (doc.product_id_list.includes(product._id)) {
                                // Push the new product ID to the product list array
                                doc.product_id_list.pop(product._id);
                                const new_doc = await doc.save({ session: session });
                                console.log(new_doc)

                            }   
                        }
                        
                    }
                }

            }catch(error){
                await session.abortTransaction();
                session.endSession();
                return res.status(501).json({
                    status: "Error",
                    message: error.message
                });
            }
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json({
                massage: "OK",
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
    var product = await Product.findOne({ _id: product_id, user_id : id});
    console.log("product :- " + product)
    if (product != null) {
        const arrayToBeDeleted = product.profile_id
        const session = await mongoose.startSession();
        session.startTransaction();
        try{
            const deleted_product = await product.deleteOne().session(session);
            console.log("arrayToBeDeleted :- " + arrayToBeDeleted)
            var delete_docs = await Profile.find({ _id: { $in: arrayToBeDeleted }, user_id: id}).session(session);
            if (!delete_docs) {
                throw new Error('Document not found');
            }
            console.log("delete_docs :- " + delete_docs.length)
            for (var i = 0; i < delete_docs.length; i++) {
                console.log("Looping")
                var doc = delete_docs[i];
                if (doc.product_id_list.includes(product_id)) {
                    // Push the new product ID to the product list array
                    if(doc.product_id_list.length == 1){
                        doc.product_id_list = []
                    }else{
                        doc.product_id_list.filter(item => item !== product_id);
                    }
                    // doc.product_id_list.pop(product_id);
                    await doc.save({ session: session });
                }
            }
        }catch(error){
            await session.abortTransaction();
                session.endSession();
                return res.status(501).json({
                    status: "Error",
                    message: error.message
                });
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            product: "deleted",
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



function getArrayToBeDeletedArr(arrA, arrB) {
    var result = [];
    for (var i = 0; i < arrA.length; i++) {
        if (!arrB.includes(arrA[i].toString())) {
            result.push(arrA[i].toString());
        }
    }
    return result;
}

function getArrayToBeAddedArr(arrA, arrB) {
    var result = [];
    for (var i = 0; i < arrB.length; i++) {
        if (!arrA.includes(arrB[i].toString())) {
            result.push(arrB[i].toString());
        }
    }
    return result;
}

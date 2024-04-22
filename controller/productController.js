import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import slugify from "slugify";
import fs from 'fs';
import path from 'path';

// import braintree from "braintree";
// import dotenv from "dotenv";

// dotenv.config();

// //payment gateway
// var gateway = new braintree.BraintreeGateway({
//   environment: braintree.Environment.Sandbox,
//   merchantId: process.env.BRAINTREE_MERCHANT_ID,
//   publicKey: process.env.BRAINTREE_PUBLIC_KEY,
//   privateKey: process.env.BRAINTREE_PRIVATE_KEY,
// });


// Create Product Controller
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.body;

    // Validation
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Process photos
    const photos = req.files.map((file) => ({
      data: Buffer.from(fs.readFileSync(file.path)), // Read file content and convert to Buffer
      contentType: file.mimetype,
    }));

    // Get the user information from the authenticated user
    const user = await userModel.findById(req.user._id);

    // Create new product
    const newProduct = new productModel({
      name,
      description,
      price,
      category,
      quantity,
      shipping,
      photos,
      user: user._id, // Assuming the user ID is available in the user object
      slug: slugify(name), // Generate slug based on the product name
      phoneNumber: user.phone, // Assuming user's phone number is available
      address: user.address, // Assuming user's address is available
    });

    // Save the product to the database
    await newProduct.save();

    //  Clear uploads folder
    clearUploadsFolder();

    res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });


  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error in creating product' });
  }
};

const UPLOADS_FOLDER = path.join(process.cwd(), 'uploads'); // Change 'uploads' to your actual uploads folder name

const clearUploadsFolder = () => {
  try {
    // Get a list of files in the uploads folder
    const files = fs.readdirSync(UPLOADS_FOLDER);

    // Remove each file from the uploads folder
    files.forEach(file => {
      const filePath = path.join(UPLOADS_FOLDER, file);
      fs.unlinkSync(filePath);
    });

    console.log('Uploads folder cleared successfully');
  } catch (error) {
    console.error('Error clearing uploads folder:', error);
  }
};

// get photo Controller
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photos");
    if (product.photos[0].data) {
      res.set("Content-type", product.photos[0].contentType);
      return res.status(200).send(product.photos[0].data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

// Get single photo controller  (for  Product Details Carousel)
export const getSinglePhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photos");

    if (!product) {
      return res.status(404).send({ success: false, message: "Product not found" });
    }

    // Directly access the photo by its ID from the product's photos array
    const photo = product.photos.id(req.params.photoId);

    if (!photo) {
      return res.status(404).send({ success: false, message: "Photo not found" });
    }

    // Assuming photo.data contains the binary data of the photo
    res.set("Content-type", photo.contentType);
    res.status(200).send(photo.data);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};


// get all photos of the product
export const allProductPhotosController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photos");
    const photos = product.photos.map(photo => ({
      _id: photo._id,
      contentType: photo.contentType
    }));
    res.status(200).json({ photos });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting photos",
      error,
    });
  }
};


//get all products
export const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("name price category slug photos") // Include photos field
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: "All Products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};


// get specific user ads 
export const getAdsByUserController = async (req, res) => {
  try {
    // Assuming you have authentication middleware that sets req.user
    const userId = req.user._id;

    // Adjust the query to find ads posted by the authenticated user
    const products = await productModel
      .find({ user: userId }) // Assuming "user" is the field that stores the user ID in your product model
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: "All Products by User",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single product",
      error,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//upate product  controller
// Update product controller
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.fields;
    const { photos } = req.files; // Assuming photos are sent as an array of files

    // Validation
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Find the product by ID
    const product = await productModel.findById(req.params.pid);

    // Update product fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.quantity = quantity;
    product.shipping = shipping;

    // If photos are provided, update the photos array
    if (photos && photos.length > 0) {
      const updatedPhotos = photos.map((file) => ({
        data: fs.readFileSync(file.path),
        contentType: file.type,
      }));
      product.photos = updatedPhotos;
    }

    // Save the updated product
    await product.save();

    res.status(200).json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Error updating product' });
  }
};


// filters
export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

// product count
export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// product list base on page
export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const resutls = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(resutls);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// similar products
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

// //payment gateway api
// //token
// export const braintreeTokenController = async (req, res) => {
//   try {
//     gateway.clientToken.generate({}, function (err, response) {
//       if (err) {
//         res.status(500).send(err);
//       } else {
//         res.send(response);
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// //payment
// export const brainTreePaymentController = async (req, res) => {
//   try {
//     const { nonce, cart } = req.body;
//     let total = 0;
//     cart.map((i) => {
//       total += i.price;
//     });
//     let newTransaction = gateway.transaction.sale(
//       {
//         amount: total,
//         paymentMethodNonce: nonce,
//         options: {
//           submitForSettlement: true,
//         },
//       },
//       function (error, result) {
//         if (result) {
//           const order = new orderModel({
//             products: cart,
//             payment: result,
//             buyer: req.user._id,
//           }).save();
//           res.json({ ok: true });
//         } else {
//           res.status(500).send(error);
//         }
//       }
//     );
//   } catch (error) {
//     console.log(error);
//   }
// };

import express from "express";
import {
  createProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFiltersController,
  productCountController,
  productListController,
  searchProductController,
  realtedProductController,
  productCategoryController,
  getAdsByUserController,
  allProductPhotosController,
  getSinglePhotoController,
} from "../controller/productController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";
import multer from 'multer';


const router = express.Router();

// Create Product route
// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Destination folder for storing the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Generate unique file names
  },
});

// Multer file filter configuration
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept only image files
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({ storage, fileFilter });

// Create Ad route
router.post('/create-product', requireSignIn, upload.array('photos', 6), createProductController);

// Update Product route
router.put(
  "/update-product/:pid",
  requireSignIn,
  formidable(),
  updateProductController
);

// get sigle photo of the add for product details Carousel
router.get('/single-photo/:pid/:photoId', getSinglePhotoController);

// get all the photos of the Ads 
router.get('/all-product-photos/:pid', allProductPhotosController);

// Get all products (ads)
router.get("/get-product", getProductController);

// Get ads of specific user
router.get("/get-ads", requireSignIn, getAdsByUserController);

// Get single product (Ad)
router.get("/get-product/:slug", getSingleProductController);

// Get first photo of a product (Ad)
router.get("/product-photo/:pid/:photoId", productPhotoController);

// Delete product (Ad)
router.delete("/delete-product/:pid", deleteProductController);

// Filter products (Ads)
router.post("/product-filters", productFiltersController);

// Get product count (Ads)
router.get("/product-count", productCountController);

// Get products per page (Ads)
router.get("/product-list/:page", productListController);

// Search product (Ads)
router.get("/search/:keyword", searchProductController);

// Get related products (Ads)
router.get("/related-product/:pid/:cid", realtedProductController);

// Get products by category (ads)
router.get("/product-category/:slug", productCategoryController);

export default router;

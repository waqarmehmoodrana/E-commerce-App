import express from "express";
import {
  registerController,
  loginController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  allUsers,
  getLoggedInUserIdController,
  getUserDataController
} from "../controller/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

// router Object
const router = express.Router();


// Routing

// REGISTER || METHOD POST
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

// Protected User Auth Route
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true })
});

//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});


// FORGOT PASSWORD || POST
router.post("/forgot-password", forgotPasswordController);



//update profile
router.put("/profile", requireSignIn, updateProfileController);

//orders
router.get("/orders", requireSignIn, getOrdersController);

//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

// Get All Users and search the sepecific user for Chat Module
router.get('/all-users', requireSignIn, allUsers);

// New route to get the logged-in user ID
router.get('/user-id', requireSignIn, getLoggedInUserIdController);


router.get('/user-data', requireSignIn, getUserDataController);

export default router;

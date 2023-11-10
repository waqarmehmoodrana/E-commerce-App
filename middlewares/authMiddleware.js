import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//Protected Route Token Base
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

// Admin access
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id)

    if (user.role !== 1) {
      res.status(401).send({
        success: false,
        message: "UnAuthorized access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
        success:false,
        error,
        messsage:"Error in admin middleware"
    })
  }
};

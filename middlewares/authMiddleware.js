import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//Protected Route Token Base


// export const requireSignIn = async (req, res, next) => {
//   try {
//     const decode = JWT.verify(
//       req.headers.authorization,
//       process.env.JWT_SECRET
//     );
//     req.user = decode;
//     next();
//   } catch (error) {
//     console.log(error);
//   }
// };


export const requireSignIn = async (req, res, next) => {
  try {
    // Check if Authorization header is present
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing',
      });
    }

    // Extract token from Authorization header
    const token = req.headers.authorization.split(' ')[1];

    // Verify the token
    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // Attach decoded user information to request object
    req.user = decoded;

    // Call next middleware
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
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
      success: false,
      error,
      messsage: "Error in admin middleware"
    })
  }
};

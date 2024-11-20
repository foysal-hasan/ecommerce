import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token =
    req.cookies?.jwt ||
    req.body.token ||
    req.headers?.authorization?.split(" ")[1];

  // console.log(req.headers?.authorization.split(" ")[1]);

  // console.log(req.headers);

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    console.log(userId);

    req.user = await User.findById(userId).select("-password");
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, no failed");
  }
});

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as admin");
  }
};

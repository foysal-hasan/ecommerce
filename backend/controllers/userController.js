import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";
import generateTokenAndSendResponse from "../utils/generateTokenAndSendResponse.js";

const generateResponse = (res, user) => {
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
};
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(401);
    throw new Error("Provide name, email and password");
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    res.status(401);
    throw new Error("Email already in use");
  }

  const user = await User.create({ name, email, password });
  generateTokenAndSendResponse(res, user);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(401);
    throw new Error("Provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  generateTokenAndSendResponse(res, user);
});

export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    expiresIn: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
};
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  generateResponse(res, user);
});
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.name = req.body.name || req.user.name;
  user.email = req.body.email || req.user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  generateResponse(res, updatedUser);
});
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ length: users.length, users });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Can not delete admin user");
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

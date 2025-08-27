import cloudinary from "../library/cloudinary.js";
import { generateToken } from "../library/utils.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (socket, data, callback) => {
  const { name, email, password, profilePic } = data;
  try {
    if (!name || !email || !password) {
      return callback({ error: "All fields are required" });
    }
    if (password.length < 8) {
      return callback({ error: "Password must be at least 8 characters" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return callback({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic,
    });
    await newUser.save();
    const token = generateToken(newUser._id);
    callback({
      success: true,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    callback({ error: "Internal server error" });
  }
};

export const login = async (socket, data, callback) => {
  const { email, password } = data;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return callback({ error: "No such user" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return callback({ error: "Incorrect password" });
    }
    const token = generateToken(user._id);
    callback({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    callback({ error: "Internal server error" });
  }
};

export const logout = async (socket, data, callback) => {
  try {
    callback({ success: true, message: "Logged out successfully" });
    socket.disconnect();
  } catch (error) {
    console.error("Logout error:", error);
    callback({ error: "Internal server error" });
  }
};

export const update = async (socket, data, callback) => {
  try {
    console.log(data);

    const { profilePic, userId } = data;
    if (!profilePic || !userId) {
      return callback({ error: "Profile pic and user ID are required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    callback({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    callback({ error: "Internal server error" });
  }
};

export const checkAuth = async (socket, callback) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return callback({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return callback({ error: "User not found" });
    }

    callback({ success: true, user });
  } catch (error) {
    console.error("Check auth error:", error);
    callback({ error: "Invalid or expired token" });
  }
};

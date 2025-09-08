import cloudinary from "../library/cloudinary.js";
import { onlineUsers } from "../library/socket.js";
import { generateToken } from "../library/utils.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

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
    const otp = generateOtp();
    const otpExpiry = Date.now() + 10 * 60 * 1000;
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic,
      otp,
      otpExpiry,
      isVerified: false,
    });
    await newUser.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your account - OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });
    callback({
      success: true,
      message: "OTP sent to email. Please verify.",
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
    if (!user.isVerified) {
      return callback({
        error: "Please verify your email with the OTP before logging in.",
      });
    }
    if (user.blockedByCount >= 5) {
      return callback({
        error: "Your account has been restricted due to multiple reports.",
      });
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

export const verifyOtp = async (socket, data, callback) => {
  const { email, otp } = data;
  try {
    const user = await User.findOne({ email });
    if (!user) return callback({ error: "User not found" });
    if (user.isVerified) return callback({ error: "User already verified" });
    if (user.otp !== otp || Date.now() > user.otpExpiry) {
      return callback({ error: "Invalid or expired OTP" });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
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
    console.error("OTP verification error:", error);
    callback({ error: "Internal server error" });
  }
};

export const getOnlineFriends = async (socket, data, callback) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return callback({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate("friends");
    if (!user) return callback({ error: "User not found" });
    const validFriends = user.friends.filter((f) => f.blockedByCount < 5);
    const onlineFriends = validFriends.filter((friend) =>
      onlineUsers.has(friend._id.toString())
    );
    callback({
      success: true,
      friends: onlineFriends,
    });
  } catch (error) {
    console.error("Get online friends error:", error);
    callback({ error: "Internal server error" });
  }
};

export const forgotPassword = async (socket, data, callback) => {
  const { email } = data;
  try {
    const user = await User.findOne({ email });
    if (!user) return callback({ error: "User not found" });
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
    });
    callback({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    callback({ error: "Internal server error" });
  }
};

export const verifyResetOtp = async (socket, data, callback) => {
  const { email, otp } = data;
  try {
    const user = await User.findOne({ email });
    if (!user) return callback({ error: "User not found" });
    if (user.otp !== otp || Date.now() > user.otpExpiry) {
      return callback({ error: "Invalid or expired OTP" });
    }
    callback({
      success: true,
      message: "OTP verified, proceed to reset password",
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    callback({ error: "Internal server error" });
  }
};

export const resetPassword = async (socket, data, callback) => {
  const { email, newPassword } = data;
  try {
    const user = await User.findOne({ email });
    if (!user) return callback({ error: "User not found" });
    if (newPassword.length < 8) {
      return callback({ error: "Password must be at least 8 characters" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    callback({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    callback({ error: "Internal server error" });
  }
};

export const resendOtp = async (socket, data, callback) => {
  const { email } = data;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return callback({ error: "User not found" });
    }
    if (user.isVerified) {
      return callback({ error: "User already verified" });
    }
    const now = Date.now();
    if (
      user.resendOtpLast &&
      now - user.resendOtpLast.getTime() > 15 * 60 * 1000
    ) {
      user.resendOtpCount = 0;
    }
    if (user.resendOtpCount >= 3) {
      return callback({
        error: "Too many OTP requests. Please try again after 15 minutes.",
      });
    }
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = now + 10 * 60 * 1000;
    user.resendOtpCount += 1;
    user.resendOtpLast = new Date(now);
    await user.save();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend OTP - Verify your account",
      text: `Your new OTP is ${otp}. It is valid for 10 minutes.`,
    });
    callback({ success: true, message: "OTP resent to your email" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    callback({ error: "Internal server error" });
  }
};

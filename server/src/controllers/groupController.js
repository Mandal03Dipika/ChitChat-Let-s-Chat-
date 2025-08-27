import Group from "../models/groupModel.js";
import cloudinary from "../library/cloudinary.js";
import mongoose from "mongoose";

export const createGroup = async (socket, data, callback) => {
  try {
    const { name, description, profilePic, members, admins } = data;
    let profilePicUrl = "";
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      profilePicUrl = uploadResponse.secure_url;
    }
    const newGroup = new Group({
      name,
      description,
      profilePic: profilePicUrl,
      members,
      admins,
    });
    await newGroup.save();
    callback({ success: true, group: newGroup });
  } catch (error) {
    console.log("Error in createGroup:", error.message);
    callback({ error: "Internal server error" });
  }
};

export const updateGroup = async (socket, data, callback) => {
  try {
    const { groupId, name, description, profilePic, members, admins } = data;
    let updatedData = { name, description, members, admins };
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updatedData.profilePic = uploadResponse.secure_url;
    }
    const updatedGroup = await Group.findByIdAndUpdate(groupId, updatedData, {
      new: true,
    });
    callback({ success: true, group: updatedGroup });
  } catch (error) {
    console.log("Error in updateGroup:", error.message);
    callback({ error: "Internal server error" });
  }
};

export const getGroup = async (socket, data, callback) => {
  try {
    const { groupId } = data;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return callback({ error: "Invalid group ID" });
    }
    const group = await Group.findById(groupId);
    if (!group) {
      return callback({ error: "Group not found" });
    }
    callback({ success: true, group });
  } catch (error) {
    console.log("Error in getGroup:", error.message);
    callback({ error: "Internal server error" });
  }
};

export const deleteGroup = async (socket, data, callback) => {
  try {
    const { groupId } = data;
    await Group.findByIdAndDelete(groupId);
    callback({ success: true, message: "Group deleted successfully" });
  } catch (error) {
    console.log("Error in deleteGroup:", error.message);
    callback({ error: "Internal server error" });
  }
};

export const getAllGroup = async (socket, data, callback) => {
  try {
    const groups = await Group.find();
    callback({ success: true, groups });
  } catch (error) {
    console.log("Error in getAllGroups:", error.message);
    callback({ error: "Internal server error" });
  }
};

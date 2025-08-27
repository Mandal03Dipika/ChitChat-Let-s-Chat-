import mongoose from "mongoose";
import cloudinary from "../library/cloudinary.js";
import { getReceiverSocketId, io } from "../library/socket.js";
import Group from "../models/groupModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const uploadToCloudinary = async (file) => {
  const uploadResponse = await cloudinary.uploader.upload(file, {
    folder: "chat_files",
    resource_type: "auto",
  });
  return {
    url: uploadResponse.secure_url,
    type: uploadResponse.resource_type,
  };
};

export const getUsersForSidebar = async (socket, data, callback) => {
  try {
    const userId = socket.userId;
    if (!userId) return callback({ error: "Unauthorized" });
    const currentUser = await User.findById(userId).select("friends");
    const friendsIds = currentUser.friends || [];
    const users = await User.find({
      _id: { $nin: [userId, ...friendsIds] },
    }).select("-password");
    callback({ success: true, users });
  } catch (error) {
    console.error("Error getting users:", error);
    callback({ error: "Something went wrong" });
  }
};

export const getMessages = async (socket, data, callback) => {
  try {
    const { senderId, receiverId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
      return callback({ error: "User not found" });
    }
    if (
      sender.blockedUsers.includes(receiverId) ||
      receiver.blockedUsers.includes(senderId)
    ) {
      return callback({
        error:
          "You cannot view messages because one of you has blocked the other",
      });
    }
    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    const messages = await Message.find({
      groupId: null,
      $or: [
        { senderId: senderObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: senderObjectId },
      ],
    }).sort({ createdAt: 1 });
    callback({ success: true, messages });
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (socket, data, callback) => {
  try {
    const { text, file, receiverId, senderId } = data;
    if (!senderId || !receiverId || (!text && !file)) {
      return callback({
        error: "Message must have a sender, receiver, and content",
      });
    }
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) {
      return callback({ error: "User not found" });
    }
    if (
      sender.blockedUsers.includes(receiverId) ||
      receiver.blockedUsers.includes(senderId)
    ) {
      return callback({
        error:
          "You cannot send messages because one of you has blocked the other",
      });
    }
    let fileUrl = null;
    let fileType = null;
    if (file) {
      const { url, type } = await uploadToCloudinary(file);
      fileUrl = url;
      fileType = type;
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      file: fileUrl,
      fileType,
    });
    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    socket.emit("newMessage", newMessage);
    callback({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const blockUser = async (socket, data, callback) => {
  try {
    const { userId, blockUserId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(blockUserId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    if (userId === blockUserId) {
      return callback({ error: "You cannot block yourself" });
    }
    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: blockUserId },
    });
    callback({ success: true, message: "User blocked successfully" });
  } catch (error) {
    console.error("Error in blockUser:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const unblockUser = async (socket, data, callback) => {
  try {
    const { userId, unblockUserId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(unblockUserId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: unblockUserId },
    });
    callback({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error in unblockUser:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const deleteAllChats = async (socket, data, callback) => {
  try {
    const { userId, otherUserId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(otherUserId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const otherObjectId = new mongoose.Types.ObjectId(otherUserId);
    const result = await Message.deleteMany({
      groupId: null,
      $or: [
        { senderId: userObjectId, receiverId: otherObjectId },
        { senderId: otherObjectId, receiverId: userObjectId },
      ],
    });
    const receiverSocketId = getReceiverSocketId(otherUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chatsDeleted", {
        userId,
        otherUserId,
      });
    }
    socket.emit("chatsDeleted", { userId, otherUserId });
    callback({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error in deleteAllChats:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const sendGroupMessage = async (socket, data, callback) => {
  try {
    const senderId = socket.userId || data.senderId;
    const { text, file, groupId } = data;
    if (!senderId || !groupId || (!text && !file)) {
      return callback({ error: "Must have content, sender, and groupId" });
    }
    let fileUrl = null;
    let fileType = null;
    if (file) {
      const { url, type } = await uploadToCloudinary(file);
      fileUrl = url;
      fileType = type;
    }
    const newMessage = new Message({
      senderId,
      groupId,
      text,
      file: fileUrl,
      fileType,
    });
    await newMessage.save();
    const group = await Group.findById(groupId);
    group.members.forEach((member) => {
      const memberSocketId = getReceiverSocketId(member._id.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("newGroupMessage", newMessage);
      }
    });
    callback({ success: true, message: newMessage });
  } catch (error) {
    console.log("Error in sendGroupMessage: ", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const getGroupMessages = async (socket, data, callback) => {
  try {
    const { groupId } = data;
    const messages = await Message.find({ groupId });
    callback({ success: true, messages });
  } catch (error) {
    console.log("Error in getGroupMessages: ", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const getGroupsForSidebar = async (socket, data, callback) => {
  try {
    const { userId } = data;
    const groups = await Group.find({
      $or: [{ members: userId }, { admins: userId }],
    }).select("-__v");
    callback({ success: true, groups });
  } catch (error) {
    console.log("Error in getGroupsForSidebar: ", error.message);
    callback({ error: "Failed to fetch groups." });
  }
};

export const getUser = async (socket, data, callback) => {
  try {
    const { userId } = data;
    const user = await User.findById(userId);
    callback({ success: true, user });
  } catch (error) {
    console.log("Error in getUser: ", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const leaveGroup = async (socket, data, callback) => {
  try {
    const { groupId, userId } = data;
    const group = await Group.findById(groupId);
    if (!group) {
      return callback({ error: "Group not found" });
    }
    const isMember = group.members.includes(userId);
    const isAdmin = group.admins.includes(userId);
    if (!isMember && !isAdmin) {
      return callback({ error: "User is not a member or admin of this group" });
    }
    group.members = group.members.filter(
      (id) => id.toString() !== userId.toString()
    );
    if (isAdmin) {
      group.admins = group.admins.filter(
        (id) => id.toString() !== userId.toString()
      );
      if (group.admins.length === 0 && group.members.length > 0) {
        group.admins = [group.members[0]];
      }
    }
    if (group.members.length === 0) {
      await group.deleteOne();
      return callback({
        success: true,
        message: "Group deleted as no members remain",
      });
    }
    await group.save();
    callback({ success: true, message: "Successfully left the group" });
  } catch (error) {
    console.log("Error in leaveGroup: ", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (socket, data, callback) => {
  try {
    const { fromUserId, toUserId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(fromUserId) ||
      !mongoose.Types.ObjectId.isValid(toUserId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    if (fromUserId === toUserId) {
      return callback({ error: "You cannot send a request to yourself" });
    }
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    if (!fromUser || !toUser) {
      return callback({ error: "User not found" });
    }
    if (
      toUser.friendRequests.includes(fromUserId) ||
      fromUser.sentRequests.includes(toUserId)
    ) {
      return callback({ error: "Request already sent" });
    }
    await User.findByIdAndUpdate(toUserId, {
      $addToSet: { friendRequests: fromUserId },
    });
    await User.findByIdAndUpdate(fromUserId, {
      $addToSet: { sentRequests: toUserId },
    });
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestReceived", {
        fromUserId,
        username: fromUser.username,
      });
    }
    callback({ success: true, message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (socket, data, callback) => {
  try {
    const { userId, requesterId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(requesterId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);
    if (!user || !requester) {
      return callback({ error: "User not found" });
    }
    if (!user.friendRequests.includes(requesterId)) {
      return callback({ error: "No pending request from this user" });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { friendRequests: requesterId },
      $addToSet: { friends: requesterId },
    });
    await User.findByIdAndUpdate(requesterId, {
      $pull: { sentRequests: userId },
      $addToSet: { friends: userId },
    });
    const requesterSocketId = getReceiverSocketId(requesterId);
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friendRequestAccepted", {
        userId,
        username: user.username,
      });
    }
    socket.emit("friendRequestAccepted", {
      userId: requesterId,
      username: requester.username,
    });
    callback({ success: true, message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const rejectFriendRequest = async (socket, data, callback) => {
  try {
    const { userId, requesterId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(requesterId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    const user = await User.findById(userId);
    if (!user) return callback({ error: "User not found" });
    if (!user.friendRequests.includes(requesterId)) {
      return callback({ error: "No pending request from this user" });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { friendRequests: requesterId },
    });
    await User.findByIdAndUpdate(requesterId, {
      $pull: { sentRequests: userId },
    });
    const requesterSocketId = getReceiverSocketId(requesterId);
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friendRequestRejected", { userId });
    }
    callback({ success: true, message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const cancelFriendRequest = async (socket, data, callback) => {
  try {
    const { fromUserId, toUserId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(fromUserId) ||
      !mongoose.Types.ObjectId.isValid(toUserId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    if (!fromUser || !toUser) {
      return callback({ error: "User not found" });
    }
    await User.findByIdAndUpdate(toUserId, {
      $pull: { friendRequests: fromUserId },
    });
    await User.findByIdAndUpdate(fromUserId, {
      $pull: { sentRequests: toUserId },
    });
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestCancelled", { fromUserId });
    }
    callback({ success: true, message: "Friend request cancelled" });
  } catch (error) {
    console.error("Error in cancelFriendRequest:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const toggleFriendRequest = async (socket, data, callback) => {
  try {
    const { fromUserId, toUserId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(fromUserId) ||
      !mongoose.Types.ObjectId.isValid(toUserId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    if (fromUserId === toUserId) {
      return callback({ error: "You cannot send a request to yourself" });
    }
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    if (!fromUser || !toUser) {
      return callback({ error: "User not found" });
    }
    if (
      toUser.friendRequests.includes(fromUserId) ||
      fromUser.sentRequests.includes(toUserId)
    ) {
      await User.findByIdAndUpdate(toUserId, {
        $pull: { friendRequests: fromUserId },
      });
      await User.findByIdAndUpdate(fromUserId, {
        $pull: { sentRequests: toUserId },
      });
      const receiverSocketId = getReceiverSocketId(toUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("friendRequestCancelled", { fromUserId });
      }
      return callback({
        success: true,
        cancelled: true,
        message: "Friend request cancelled",
      });
    }
    await User.findByIdAndUpdate(toUserId, {
      $addToSet: { friendRequests: fromUserId },
    });
    await User.findByIdAndUpdate(fromUserId, {
      $addToSet: { sentRequests: toUserId },
    });
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestReceived", {
        fromUserId,
        username: fromUser.username,
      });
    }
    callback({ success: true, sent: true, message: "Friend request sent" });
  } catch (error) {
    console.error("Error in toggleFriendRequest:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const unfriendUser = async (socket, data, callback) => {
  try {
    const { userId, friendId } = data;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(friendId)
    ) {
      return callback({ error: "Invalid user IDs" });
    }
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!user || !friend) {
      return callback({ error: "User not found" });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });
    const receiverSocketId = getReceiverSocketId(friendId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRemoved", { userId });
    }
    callback({ success: true, message: "Unfriended successfully" });
  } catch (error) {
    console.error("Error in unfriendUser:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

export const getFriendRequests = async (socket, data, callback) => {
  try {
    const { userId } = data;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return callback({ error: "Invalid user ID" });
    }
    const user = await User.findById(userId)
      .populate("friendRequests", "username email avatar")
      .populate("sentRequests", "username email avatar");
    if (!user) {
      return callback({ error: "User not found" });
    }
    callback({
      success: true,
      requests: {
        incoming: user.friendRequests,
        outgoing: user.sentRequests,
      },
    });
  } catch (error) {
    console.error("Error in getFriendRequests:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

// Backend: Get Friends
export const getFriends = async (socket, data, callback) => {
  try {
    const { userId } = data;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return callback({ error: "Invalid user ID" });
    }

    // Fetch user with friends populated
    const user = await User.findById(userId).populate(
      "friends",
      "username email avatar"
    );

    if (!user) {
      return callback({ error: "User not found" });
    }

    // Return the list of friends
    callback({
      success: true,
      friends: user.friends,
    });
  } catch (error) {
    console.error("Error in getFriends:", error.message);
    callback({ error: "Internal Server Error" });
  }
};

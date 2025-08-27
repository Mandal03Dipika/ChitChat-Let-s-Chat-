import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.groupId;
      },
    },
    text: { type: String },
    file: { type: String },
    fileType: { type: String },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;

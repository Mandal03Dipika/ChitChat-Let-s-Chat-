import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    profilePic: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;

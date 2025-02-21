import mongoose, { Schema } from "mongoose";
export const settingSchema = new Schema(
  {
    image: {
      type: String
    },
    hyperLink: {
      type: String
    },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Active", "InActive"], // Correctly defined enum values
      required: true, // Optional: enforce that status must be provided
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "setting" }
);

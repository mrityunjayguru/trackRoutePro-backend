import mongoose, { Schema } from "mongoose";
export const privacyPolicySchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "privacyPolicy" }
);

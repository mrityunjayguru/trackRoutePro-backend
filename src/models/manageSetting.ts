import mongoose, { Schema } from "mongoose";

export const settingsSchema = new Schema(
  {
    mobileSupport: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // Ensure it's a 10-digit number
    },
    supportEmail: {
      type: String,
      required: true,
      match: /^\S+@\S+\.\S+$/, // Ensure valid email format
    },
    emailTitle: {
      type: String,
      required: true,
    },
    catalogueLink: {
      type: String,
      required: true,
    },
    websiteLink: {
      type: String,
      required: true,
    },
    websiteLabel: {
      type: String,
      required: true,
    },
    privacyLink: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    applogo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "Active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming the user model is called "User"
    },
  },
  {
    timestamps: true, // This adds both createdAt and updatedAt fields automatically
    collection: "ManageSettings", // Collection name corrected to "ManageSettings"
  }
);

// Export the model
const ManageSettings = mongoose.model("Settings", settingsSchema);
export default ManageSettings;

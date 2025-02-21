import mongoose, { Schema } from "mongoose";
export const AleartsSchema = new Schema(
  {
    title: {
      type: String,
    },
    notificationalert: {
      type: Object, // Adjust the type as needed to match your structure
      default: {},
    },
    ownerID: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    deviceId: { type: String },
    imei: { type: String },
    alertfor: {
      type: String,
    },
    location: {
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true },
      },
      trackingID:{
      type: mongoose.Schema.Types.ObjectId, ref: "Vehicletracking"
      },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "alearts" }
);

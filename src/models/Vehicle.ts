import mongoose, { Schema, model } from "mongoose";
import { Imei } from "../services/admin/Imei/_validation";

export const vehicleDetailsSchema = new Schema(
  {
    vehicleRegistrationNo: { type: String, unique: false, default: "" },
    fuelStatus: { type: String, enum: ["Off", "On"] },
    vehicleNo: { type: String },
    imei: { type: String, required: true, unique: true },
    vehicleType: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "vehicleType",
    },
    dealerCode: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },

    deviceSimNumber: {
      type: String,
    },
    operator: {
      type: String,
    },
    Subscription: { type: Date },

    fuleOutput: {
      type: String,
    },
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    delearid: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    dateAdded: { type: Date, default: Date.now },
    driverName: { type: String },
    mobileNo: { type: String },
    subscriptiostart: { 
      type: Date, 
      default: Date.now  // Sets the current date as default
    },
    subscriptionexp: { 
      type: Date, 
      default: function() {
        const oneYearLater = new Date();
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        return oneYearLater;
      }
    },
    vehicleBrand: { type: String },
    vehicleModel: { type: String },
    insuranceExpiryDate: { type: Date },
    pollutionExpiryDate: { type: Date },
    fitnessExpiryDate: { type: Date },
    nationalPermitExpiryDate: { type: Date },
    maxSpeed: { type: Number, default: 40 },
    parking: { type: Boolean, default: false },
    parkingSpeed: { type: Number, default: 3 },
    locationStatus:{type:Boolean,default:false},
    speedStatus:{type:Boolean,default:false},
    isAppCreated:{type:Boolean,default:false},
    location: {
      longitude: { type: Number },
      latitude: { type: Number },
    },
    Area: { type: String, default: "" },
    createdBy: {
      type: {
        id: { type: String, required: true }, // User ID
        time: { type: Date, default: Date.now }, // Creation time
      },
      default: {}, // Default value if not provided
    },
    immobiliser: {
      type: String,
      enum: ["Start", "Stop", "Pending"],
      default: "Pending",
    },
    tankCapacity: {
      type: String, // You can adjust the type if you want it to be a number
      trim: true,
    },
    minimumValue: {
      type: String,
      trim: true,
    },
    fillDifference: {
      type: String,
      trim: true,
    },
    dataFiltrationLevel: {
      type: String,
      trim: true,
    },
    maximumValue: {
      type: String,
      trim: true,
    },
    drainDifference: {
      type: String,
      trim: true,
    },
    displayParameters: {
      AC: { type: Boolean, default: false },
      Relay: { type: Boolean, default: false },
      GPS: { type: Boolean, default: false },
      Door: { type: Boolean, default: false },
      GeoFencing: { type: Boolean, default: false },
      Network: { type: Boolean, default: false },
      Engine: { type: Boolean, default: false },
      Parking: { type: Boolean, default: false },
      Charging: { type: Boolean, default: false },
      temperature: {
        type: Boolean,
        default: false,
      },
      humidity: {
        type: Boolean,
        default: false,
      },
      bluetooth: {
        type: Boolean,
        default: false,
      },
    },

    isDeleted: { type: Boolean, default: false },
    status: { type: String, enum: ["Active", "InActive"] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "UserDevices" }
);

// Indexes for deviceId and ownerID
vehicleDetailsSchema.index({ ownerID: 1 });

// Pre-save hook to validate IMEI and Device ID during document creation
vehicleDetailsSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Check if the imei exists in the database
    const existingImei = await Imei.findOne({ imeiNo: this.imei });
    if (!existingImei) {
      const error: any = new Error("IMEI not found in the database");
      error.status = 404;
      return next(error);
    }
  }

  next(); // Proceed with saving the document
});

// Pre-update hook to validate IMEI and Device ID during updates
vehicleDetailsSchema.pre("updateOne", async function (next) {
  const update: any = this.getUpdate();
  const isUpdatingImei = update.imei;
  if (isUpdatingImei) {
    const existingImei = await Imei.findOne({ imeiNo: update.imei });
    if (!existingImei) {
      const error: any = new Error("IMEI not found in the database");
      error.status = 404;
      return next(error);
    }
  }
  next(); // Proceed with the update operation
});

// Register the model
const UserDevices = model("UserDevices", vehicleDetailsSchema);

export default UserDevices;

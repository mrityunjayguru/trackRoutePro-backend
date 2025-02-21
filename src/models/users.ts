import mongoose, { Schema, model } from "mongoose";
import config from "config";
import { encrypt } from "../helper/encription";
import jwt from "jsonwebtoken";
export const usersSchema = new Schema(
  {
    id: { type: Number, unique: false },
    Name: { type: String },
    contactPerson: { type: String },
    PersonDesignation: { type: String },
    uniqueCode: { type: String, unique: false },
    emailAddress: { type: String },
    phone: { type: String },
    password: { type: String, required: [true, "Password required"] },
    dob: { type: Date },
    gender: { type: String },
    address: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pinCode: { type: String },
    sessionVersion: { type: String },

    dealerCode: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    createdDelearId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "user",
    },
    companyId: { type: String },
    idno: { type: String },
    firebaseToken: { type: [String], default: [] },
    notification: { type: Boolean, default: true },
    permissions: {
      Subscribers: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Map: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Notification: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Support: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Device: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Admin: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Settings: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      FAQTopics: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      FAQ: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Vehicle: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
      Splash: {
        Add: { type: Boolean, default: false },
        Update: { type: Boolean, default: false },
        View: { type: Boolean, default: false },
      },
    },
    notificationPermission:{
      all: {
        type: Boolean,
        default: true,
      },
      Ignition: {
        type: Boolean,
        default: true,
      },
      Geofencing: {
        type: Boolean,
        default: true,
      },
      Over_Speed: {
        type: Boolean,
        default: true,
      },
      Parking_Alert: {
        type: Boolean,
        default: true,
      },
      AC_Door_Alert: {
        type: Boolean,
        default: true,
      },
      Fuel_Alert: {
        type: Boolean,
        default: false,
      },
      Expiry_Reminders: {
        type: Boolean,
        default: true,
      },
      Vibration: {
        type: Boolean,
        default: true,
      },
      Device_Power_Cut: {
        type: Boolean,
        default: true,
      },
      Device_Low_Battery: {
        type: Boolean,
        default: true,
      },
      Other_Alerts: {
        type: Boolean,
        default: true,
      }
    },
    profile: { type: String },
    idDocument: { type: String },
    Document: { type: String },
    profileId: { type: String },
    isView: { type: Boolean,default:true },

    otp: { type: Number },
    role: {
      type: String,
      enum: ["User", "Admin", "SuperAdmin", "Dealer"],
      default: "User",
    },
    subscribeType: { type: String, enum: ["Individual", "Company", "Dealer"] },
    token: { type: String },
    status: { type: Boolean, default: true },
    isAppCreated: { type: Boolean, default: false },
    createdBy: {
      type: {
        id: { type: String, required: false }, // User ID
        time: { type: Date, default: Date.now }, // Creation time
      },
      default: {}, // Default value if not provided
    },
    updatedBy: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: false,
        }, // User ID reference
        time: { type: Date, default: Date.now }, // Timestamp for when the update occurred
      },
    ],
    createdAt: { type: Date, default: new Date().toISOString() },
    updatedAt: { type: Date, default: new Date().toISOString() },
  },
  { collection: "users" }
);
usersSchema.index({ phone: 1, role: 1 }, { unique: true });
usersSchema.index({ emailAddress: 1, role: 1 }, { unique: true });
usersSchema.index({ idDocument: 1, role: 1 }, { unique: true, partialFilterExpression: { idDocument: { $ne: "" } } });

usersSchema.methods.getAccessToken = function () {
  const token = jwt.sign({ uid: this._id,sessionVersion:this.sessionVersion }, config.get("jwtPrivateKey"));
  return encrypt(token);
};

usersSchema.pre("save", async function (next) {
  if (!this.id) {
    // Get the count of documents in the collection
    const count = await model("users").countDocuments();
    this.id = count + 1; // Set the ID as the count + 1
  }
  next();
});
usersSchema.pre("updateOne", function (next) {
  const update:any = this.getUpdate();

  if (update && update.password) {
    console.log("Password changed, updating sessionVersion");
    this.set({ sessionVersion: new mongoose.Types.ObjectId().toString() });
  }

  next();
});




usersSchema.pre("save", async function (next) {
  // Ensure the user ID is unique
  if (!this.id) {
    const count = await model("users").countDocuments();
    this.id = count + 1; // Set the ID as the count + 1
  }

  // Ensure the uniqueCode is based on the subscriber type
  if (!this.uniqueCode) {
    let prefix = "TRPU"; // Default prefix for 'Individual' and 'Company'
    const subscriberType = this.role || "User"; // Default to 'User' if no subscriberType is provided

    // If the subscriber type is 'Dealer', use 'TRPD' as the prefix
    if (subscriberType === "Dealer") {
      prefix = "TRPD";
    }
    if (subscriberType === "Admin") {
      prefix = "TRPA";
    }
    // Get the count of users for the same subscriberType
    const count = await model("users").countDocuments({ role: subscriberType });

    // Generate the unique code based on the count
    const formattedCount = (count + 1).toString().padStart(5, "0"); // Ensure the number is padded to 5 digits
    this.uniqueCode = `${prefix}${formattedCount}`;
  }

  next();
});

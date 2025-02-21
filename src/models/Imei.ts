import mongoose, { Schema } from "mongoose";
import { Imei } from "../services/admin/Imei/_validation";
export const ImeiSchema = new Schema(
  {
    imeiNo: {
      type: String,
      required: true,
      unique:true,
    },
    deviceId: {
      type: String,
    },
    deviceType: {
       type: mongoose.Schema.Types.ObjectId, ref: "deviceType",
       required: true
    },
    assignStatus: {
      type: String,
      enum:["Unassigned","Assigned"],
      default:"Unassigned"
    },
    Assignedon:{
      type: String,
    },
    Assignedto:{
      type: String,
    },
    DealerCode:{
      type: mongoose.Schema.Types.ObjectId, ref: "user",
      require:false
    },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedBy: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: false,
          }, // User ID reference
          time: { type: Date, default: Date.now }, 
        },
      ],
      updatedAt: { type: Date, default: Date.now },
  },
  { collection: "Imei" }
);

ImeiSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Check if the imei exists in the database
    if(this.deviceId==""){
      this.deviceId="no-id"
      return
    }
    const existingImei = await Imei.findOne({ deviceId: this.deviceId });
    if (!existingImei) {
      const error: any = new Error("deviceId AllReady Exists");
      error.status = 404;
      return next(error);
    }
  }

  next(); // Proceed with saving the document
});
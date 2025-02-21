import mongoose, { Schema } from "mongoose";
export const cashingAleartsSchema = new Schema(
  {
    ownerID:{type: mongoose.Schema.Types.ObjectId, ref: "user"},
    deviceDetail:{type: mongoose.Schema.Types.ObjectId, ref: "UserDevices"},
    imei: { type: String,unique:true, index: true },
    maxSpeed: { type: Boolean, default: true },
    lessSpeed: { type: Boolean, default: false },
    parkingSpeed: { type: Boolean, default: true },
    geoFenceOut: { type: Boolean, default: true },
    geoFenceIn: { type: Boolean, default: true },
    doorOpne: { type: Boolean, default: true },
    doorClose: { type: Boolean, default: true },
    gpsOn: { type: Boolean, default: true },
    gpsOf: { type: Boolean, default: true },
    acOn: { type: Boolean, default: true },
    acOf: { type: Boolean, default: true },
    ininiousOn: { type: Boolean, default: true },
    ininiousOf: { type: Boolean, default: true },
    networkOn: { type: Boolean, default: true },
    networkOf: { type: Boolean, default: true },
    internalBattery: { type: Number },
    externalBattery: { type: Number },
    // fuleLevel:{ type: Number },
    fuelLevel:{ type: Number },

     
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "cashingAlearts"
  }
);

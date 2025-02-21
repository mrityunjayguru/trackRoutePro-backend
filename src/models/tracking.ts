import { Schema } from "mongoose";

export const vehicleTrackingSchema = new Schema(
  {
    deviceID: { type: String, required: true },
    deviceIMEI: { type: String, required: true },
    vehicleNo: { type: String, required: true },
    simIMEI: { type: String, default: null },
    posID: { type: String, default: null }, // POS ID
    simMobileNumber: { type: String, default: null },
    location: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
    },
    course: { type: String, required: true }, // Direction
    status: { type: String },
    lastUpdateTime: { type: Date, required: true },
    vehicleType: { type: String, required: true }, // Type of Vehicle
    deviceFixTime: { type: Date, required: true }, // Last Location Packet
    currentSpeed: { type: Number, required: true }, // Kmph
    totalDistanceCovered: { type: Number, required: true }, // Odometer
    fuelGauge: {
      quantity: { type: Number },
      alarm: { type: String, default: null }, // Fuel alert
    },
    ignition: {
      status: { type: Boolean, required: true }, // on/off
      alarm: { type: String, default: null }, // Ignition alert
    },
    ac: { type: Boolean, default: false }, // on/off
    door: { type: Boolean, default: false }, // on/off
    gps: { type: Boolean, required: true }, // on/off
    expiryDate: { type: Date, required: true }, // Activation / Renew
    dailyDistance: { type: Number }, // 21 Daily Distance
    tripDistance: { type: Number }, // 22 Trip Distance
    lastIgnitionTime: { type: Date }, // 23 Last Ignition Time
    externalBattery: { type: Number, required: true }, // 24 External Battery
    internalBattery: { type: Number }, // 25 Internal Battery
    fuel: { type: Number },
    powerCut: {
      type: Boolean,
    },
    vibration: {
      type: Boolean,
    },
    geoFenceIn: {
      type: Boolean,
    },
    geoFenceOut: {
      type: Boolean,
    },
    alert: {
        type: Object, // Adjust the type as needed to match your structure
        required: true ,
        default: {}
    },
    network: {
      type: String,
      enum: ["Connected", "Disconnected"],
      required: true,
    }, // 26 Network
    temperature: { type: Number }, // 27 Temperature
    adc1:{
      type: String,
    },
    humidity0:{
      type: String,

    },
    Immobilizer:{
      type: String,
    },
    Motion:{
      type: Boolean,
    },
    rssi:{
      type: String,
    },
    sat:{
      type: String,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
  { collection: "Vehicletracking" }
);

vehicleTrackingSchema.index({ deviceIMEI: 1 });



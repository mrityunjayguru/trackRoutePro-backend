import { Schema } from "mongoose";

export const VehicletrackingLogsSchema = new Schema(
  {
    deviceID: { type: String, default:""},
    deviceIMEI: { type: String, default:""},
    vehicleNo: { type: String, default:""},
    simIMEI: { type: String, default: null },
    posID: { type: String, default: null }, // POS ID
    simMobileNumber: { type: String, default: null },
    location: {
      longitude: { type: Number, default:""},
      latitude: { type: Number, default:""},
    },
    course: { type: String, default:""}, // Direction
    status: { type: String, enum: ["Online", "Offline"], default:""},
    lastUpdateTime: { type: Date, default:""},
    vehicleType: { type: String, default:""}, // Type of Vehicle
    deviceFixTime: { type: Date, default:""}, // Last Location Packet
    currentSpeed: { type: Number, default:""}, // Kmph
    totalDistanceCovered: { type: Number, default:""}, // Odometer
    fuelGauge: {
      quantity: { type: Number },
      alarm: { type: String, default: null }, // Fuel alert
    },
    ignition: {
      status: { type: Boolean, default:""}, // on/off
      alarm: { type: String, default: null }, // Ignition alert
    },
    ac: { type: Boolean, default: false }, // on/off
    door: { type: Boolean, default: false }, // on/off
    gps: { type: Boolean, default:""}, // on/off
    expiryDate: { type: Date, default:""}, // Activation / Renew
    dailyDistance: { type: Number }, // 21 Daily Distance
    tripDistance: { type: Number }, // 22 Trip Distance
    lastIgnitionTime: { type: Date }, // 23 Last Ignition Time
    externalBattery: { type: Number, default:""}, // 24 External Battery
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
    Motion:{
      type: Boolean,
    },
    rssi:{
      type: String,
    },
    sat:{
      type: String,
    },
    humidity:{
      type: String,
    },
    network: {
      type: String,
      enum: ["Connected", "Disconnected"],
      required: true,
    }, // 26 Network
    temperature: { type: Number },
    createdAt: { 
      type: Date, 
      default: getISTDate, 
    },
  },
  { collection: "VehicletrackingLogs" }
);

VehicletrackingLogsSchema.index({ deviceIMEI: 1 });

function getISTDate() {
  const date = new Date();
  const utcOffsetInMinutes = 5 * 60 + 30; // IST is UTC + 5:30
  const istDate = new Date(date.getTime() + utcOffsetInMinutes * 60000);
  return istDate;
}
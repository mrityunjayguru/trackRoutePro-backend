import  { Schema } from "mongoose";
export const summarySchema = new Schema(
  {
    imei: {
      type: String,
    },
    igitionOn: {
        type: Boolean,
      },
      igitionOF: {
        type: Boolean,
      },
      Geofence_In: {
        type: Boolean,
      },
      Geofence_Out: {
        type: Boolean,
      },
      location: {
        longitude: { type: Number, required: true },
        latitude: { type: Number, required: true },
      },
      createdAt: { 
        type: Date, 
        default: getISTDate, // Use the helper function to get IST date 
      },
    updatedAt: { type: Date,     default: getISTDate,},
  },
  { collection: "summary" }
);
function getISTDate() {
    const date = new Date();
    const utcOffsetInMinutes = 5 * 60 + 30; // IST is UTC + 5:30
    const istDate = new Date(date.getTime() + utcOffsetInMinutes * 60000);
    return istDate;
  }



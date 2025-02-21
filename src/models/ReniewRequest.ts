import mongoose, { Schema } from "mongoose";
export const renewRequestSchema = new Schema(
  {
    imei: {
      type: String,
    },
    requestStatus: {
      type: String,
      enum: ["Pending", "Paid"],
    },
    RequestID: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false },
    createdAt: { 
      type: Date, 
      default: getISTDate, // Use the helper function to get IST date 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "renewRequest" }
);
const generateUniqueRequestID = async () => {
  let ticketID: string;

  ticketID = `RR${Math.floor(10000000 + Math.random() * 90000000)}`;

  return ticketID!;
};

// Pre-save middleware to generate RequestID if missing
renewRequestSchema.pre("save", async function (next) {
  this.RequestID = await generateUniqueRequestID();
  next();
});
function getISTDate() {
  const date = new Date();
  const utcOffsetInMinutes = 5 * 60 + 30; // IST is UTC + 5:30
  const istDate = new Date(date.getTime() + utcOffsetInMinutes * 60000);
  return istDate;
}
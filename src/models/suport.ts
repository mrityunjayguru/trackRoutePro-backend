import mongoose, { Schema, model } from "mongoose";

const generateUniqueTicketID = async () => {
  let unique = false;
  let ticketID;

  while (!unique) {
    ticketID = `TKT${Math.floor(10000000 + Math.random() * 90000000)}`;
    const existing = await SupportModel.findOne({ ticketID });
    if (!existing) {
      unique = true;
    }
  }
  return ticketID;
};

export const supportSchema = new Schema(
  {
    id: { type: Number, unique: true },
    ticketID: { type: String },
    deviceID: {
      type: String,
    },
    imei: {
      type: String,
    },
    vehicleNo: {
      type: String,
    },
    suport: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    isDeleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Resolved", "Rejected"],
      default: "Pending",
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "support" }
);

supportSchema.pre("save", async function (next) {
  if (!this.id) {
    const count = await model("support").countDocuments();
    this.id = count + 1;
  }

  if (!this.ticketID) {
    this.ticketID = await generateUniqueTicketID();
  }

  next();
});

export const SupportModel = model("support", supportSchema);

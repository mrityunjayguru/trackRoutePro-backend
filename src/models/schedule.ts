import { Schema } from "mongoose";

const shiftSchema = new Schema(
  {
    shiftTag: { type: String, required: true },
    availableFrom: { type: String, default: "" },
    availableTo: { type: String, default: "" },
  },
  { _id: false }
);

export const scheduleSchema = new Schema(
  {
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospitals",
      required: [true, "Hospitals required."],
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctors",
      required: [true, "Doctor required."],
    },
    patientPerTime: { type: String, default: "" },
    scheduleDate: { type: Date, required: true },
    shifts: { type: [shiftSchema], required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { collection: "schedule" }
);

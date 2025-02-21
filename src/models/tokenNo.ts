import { Schema } from "mongoose";

export const tokenNoSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
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
    tokenNo: { type: Number, default: 0 },
    date: { type: Date, default: null },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: new Date().toISOString() },
    updatedAt: { type: Date, default: new Date().toISOString() },
  },
  { collection: "token_no" }
);

import mongoose, { Schema } from "mongoose";
export const vehicleTypeSchema  = new Schema(
  {
    vehicleTypeName: {
        type: String,
        required: true,
      },
      icons: {
        type: String,
        required: true,
      },
         isDeleted: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: {   type: mongoose.Schema.Types.ObjectId,
        ref:"user" },

    updatedAt: { type: Date,default: Date.now },
  },
  { collection: "vehicleType" }
);



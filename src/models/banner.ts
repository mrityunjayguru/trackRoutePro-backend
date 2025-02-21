import mongoose, { Schema } from "mongoose";

export const bannerSchema = new Schema(
  {
    banner: { type: String, required:true },
    createdBy: {type: mongoose.Schema.Types.ObjectId,ref:"user"},
    updatedBy: [{
        userId: {
          type: String, 
          required: false
        },
      }],
    createdAt: { type: Date, default: new Date().toISOString() },
    updatedAt: { type: Date, default: new Date().toISOString() },
    isDeleted: { type: Boolean,default:false},

  },
  { collection: "banner" }
);



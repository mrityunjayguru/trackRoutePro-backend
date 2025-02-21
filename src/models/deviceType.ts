import mongoose, { Schema } from "mongoose";

export const deviceTypeSchema = new Schema(
  {
    deviceType: { type: String, required:true,unique:true },
    status:{
        type:String,
        enum:["Active","InActive"]
    },
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
  { collection: "deviceType" }
);



import { Schema } from "mongoose";
import config from "config";
import { encrypt } from "../helper/encription";
import jwt from "jsonwebtoken";

export const adminSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    userName: { type: String, default: "" },
    emailAddress: { type: String, required: [true, "Email address required."] },
    password: { type: String, required: [true, "Password required."] },
    verificationCode: { type: String, default: null },
    createdAt: { type: Date, default: new Date().toISOString() },
    updatedAt: { type: Date, default: new Date().toISOString() },
  },
  { collection: "admin" }
);

adminSchema.methods.getAccessToken = function () {
  const token = jwt.sign({ aid: this._id }, config.get("jwtPrivateKey"));
  return encrypt(token);
};

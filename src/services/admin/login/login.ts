import { Request, Response } from "express";
import {
  Admin,
  user,
  validateSignup,
  validateEmail,
  validateResetPassword,
} from "./_validation";
import _ from "lodash";
import { decrypt, encrypt } from "../../../helper/encription";

export const signup = async (req: Request, res: Response) => {
  const { error } = validateSignup(req.body);
  if (error) throw error;

  let adminEmail: any = await Admin.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (adminEmail)
    return res
      .status(400)
      .json({ error: { emailAddress: "Email Address is already exist!." } });
  let adminUsername: any = await Admin.findOne({ userName: req.body.userName });
  if (adminUsername)
    return res
      .status(400)
      .json({ error: { userName: "User Name is already exist!." } });

  let payload: any = _.pick(req.body, ["userName", "emailAddress"]);
  payload.password = await encrypt(req.body.password);

  let newAdmin: any = new Admin(payload);
  newAdmin.createdAt = new Date().toISOString();
  newAdmin.updatedAt = new Date().toISOString();

  newAdmin = await newAdmin.save();

  res.status(200).json({ message: "Sign up Successfully..." });
};

export const login = async (req: Request, res: Response) => {
  // const { error } = validateLogin(req.body);
  // if (error) throw error;
  let payload: any = {};
  if (req.body.role == "Admin") {
    Object.assign(payload, { emailAddress: req.body.email });
    Object.assign(payload, { role: { $in: ["Admin", "SuperAdmin"] } });
  } else {
    Object.assign(payload, { phone: req.body.phone });
    Object.assign(payload, { role: { $in: ["Dealer"] } });
  }
  let Users: any = await user.findOne(payload);
  // console.log(Users,"UsersUsersUsers")
  if (!Users)
    return res.status(403).json({
      message: "Invalid Credential.",
      status: 403,
    });
  if (Users.status === "pending")
    return res
      .status(400)
      .json({ message: "mobile number Address not verified.", status: 400 });
  if (Users.status === false)
    return res.status(400).json({
      message: "Your account has been blocked! Please contact admin.",
      status: 400,
    });
  if (Users.role == "User") {
    return res.status(400).json({
      message: "Not Autharize to login",
      status: 400,
    });
  }
  let password: string = await decrypt(Users.password);
  if (req.body.password != password)
    return res.status(400).json({
      message: "Invalid Credential.",
      status: 400,
    });

  // const token: any = await Users.getAccessToken();
  const token: any = await Users.getAccessToken();

  await user.updateOne({ _id: Users._id}, { $set: { token: token } });

  res
    .status(200)
    .setHeader("x-auth-token", token)
    .json({ data: Users, token: token, message: "success", status: 200 });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { error } = validateEmail(req.body);
  if (error) throw error;

  let admin: any = await Admin.findOne({ emailAddress: req.body.emailAddress });
  if (!admin)
    return res
      .status(400)
      .json({ message: "Invalid emailAddress! Please try again." });

  admin.verificationCode = 523322;

  admin.updatedAt = new Date().toISOString();
  admin = await admin.save();

  res
    .status(200)
    .json({ message: "Reset Password Link sent on registered email address." });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { error } = validateResetPassword(req.body);
  if (error) throw error;

  let admin: any = await Admin.findOne({ emailAddress: req.body.emailAddress });
  if (!admin)
    return res.status(400).json({ message: "EmailAddress not found.." });

  admin.verificationCode = null;
  admin.password = await encrypt(req.body.password);

  admin.updatedAt = new Date().toISOString();
  admin = await admin.save();

  res.status(200).json({ message: "Passsword updated successfully." });
};

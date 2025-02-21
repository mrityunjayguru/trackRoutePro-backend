import { Request, Response } from "express";
import { Admin, validateUpdate } from "./_validation";
import _ from "lodash";
import { fileUploadHospital } from "../../../helper/upload";

const adminView = async (admin: any) => {
  admin = _.pick(admin, ["userName", "emailAddress", "password"]);
  return admin;
};

export const view = async (req: Request, res: Response) => {
  let admin: any = await Admin.findOne({ _id: req.body.aid }).select({
    password: 0,
    verificationCode: 0,
  });
  if (!admin) return res.status(400).json({ message: "No record found." });

  res.status(200).json({ data: { admin: admin } });
};

export const update = async (req: Request, res: Response) => {
  const { error } = validateUpdate(req.body);
  if (error) throw error;

  let admin: any = await Admin.findOne({ _id: req.body.aid });
  if (!admin) return res.status(404).json({ message: "No record found." });
  let adminuserName: any = await Admin.findOne({ userName: req.body.userName });
  if (adminuserName)
    return res.status(400).json({ message: "UserName Already Exist" });
  let adminemailAddress: any = await Admin.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (adminemailAddress)
    return res.status(400).json({ message: "Email Id Already Exist" });

  admin = _.assign(admin, _.pick(req.body, ["userName", "emailAddress"]));
  admin.updatedAt = new Date().toISOString();
  admin = await admin.save();
  admin = await adminView(admin);

  res.status(200).json({ message: "Profile updated successfully." });
};

export const uploadFile = async (req: Request, res: Response) => {
  await fileUploadHospital(req, res, async (err: any) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.body.filename)
      return res.status(400).json({ message: "Please select the file." });
    res.status(200).json({
      message: "File uploaded successfully.",
      data: {
        filename: req.body.filename,
      },
    });
  });
};

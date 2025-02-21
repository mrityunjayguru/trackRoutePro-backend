import { Request, Response } from "express";
import { privacyPolicy, validationprivacyPolicy, validationUpdateprivacyPolicy } from "./_validation";
import _ from "lodash";
import Helper from "../../../helper";
let data: any;
export const create = async (req: Request, res: Response) => {
  const { error } = validationprivacyPolicy(req.body);
  if (error) throw error;
  data = await privacyPolicy.create({
    ...req.body,
    createdAt: new Date().toISOString(),
  });
  res.status(200).json({ data: data, message: "success" });
};

export const get = async (req: Request, res: Response) => {
  let data: any = await privacyPolicy.find({});
  res.status(200).json({ data: data, message: "success", status: 200 });
};
export const update = async (req: Request, res: Response) => {
  const { error } = validationUpdateprivacyPolicy(req.body);
  if (error) throw error;

  let updateprivacyPolicy: any = await privacyPolicy.findOne({ _id: req.body._id });
  if (!updateprivacyPolicy)
    return res.status(404).json({ message: "No record found." });
  let payload = {};
  if (req.body.description)
    Object.assign(payload, { description: req.body.description });
  data = await privacyPolicy.updateOne({ _id: req.body._id }, payload);
  res.status(200).json({ data: data, message: "success" });
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;

  const { error } = validationUpdateprivacyPolicy(req.body);
  if (error) throw error;
  data = await privacyPolicy.deleteOne({ _id: req.body._id });
  res
    .status(Helper.Statuscode.Success)
    .json({ data: data, message: "success" });
};

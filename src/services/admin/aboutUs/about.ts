import { Request, Response } from "express";
import { about, validationabout, validationUpdateabout } from "./_validation";
import _ from "lodash";
import Helper from "../../../helper";
let data: any;
export const create = async (req: Request, res: Response) => {
  const { error } = validationabout(req.body);
  if (error) throw error;
  data = await about.create({
    ...req.body,
    createdAt: new Date().toISOString(),
  });
  res.status(200).json({ data: data, message: "success" });
};

export const get = async (req: Request, res: Response) => {
  let data: any = await about.find({});
  res.status(200).json({ data: data, message: "success", status: 200 });
};
export const update = async (req: Request, res: Response) => {
  const { error } = validationUpdateabout(req.body);
  if (error) throw error;

  let updateabout: any = await about.findOne({ _id: req.body._id });
  if (!updateabout)
    return res.status(404).json({ message: "No record found." });
  let payload = {};
  if (req.body.description)
    Object.assign(payload, { description: req.body.description });
  data = await about.updateOne({ _id: req.body._id }, payload);
  res.status(200).json({ data: data, message: "success" });
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;

  const { error } = validationUpdateabout(req.body);
  if (error) throw error;
  data = await about.deleteOne({ _id: req.body._id });
  res
    .status(Helper.Statuscode.Success)
    .json({ data: data, message: "success" });
};

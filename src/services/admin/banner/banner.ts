import { Request, Response } from "express";
import {
  banner,
  validationBanner,
  validationUpdateBanner,
} from "./_validation";
import _ from "lodash";
import Helper from "../../../helper";

export const create = async (req: Request, res: Response) => {
  const { error } = validationBanner(req.body);
  if (error) throw error;
  let addBanner: any = new banner(_.pick(req.body, ["banner"]));
  addBanner.createdAt = new Date().toISOString();
  addBanner = await addBanner.save();
  res
    .status(200)
    .json({ data: addBanner, message: "banner added successfully" , status: 200});
};

export const get = async (req: Request, res: Response) => {
  let data: any = await banner.find({});

  res.status(200).json({ data: data, message: "banner get successfully" });
};
export const update = async (req: Request, res: Response) => {
  const { error } = validationUpdateBanner(req.body);
  if (error) throw error;

  let updateBanner: any = await banner.findOne({ _id: req.body.did });
  if (!updateBanner)
    return res.status(404).json({ message: "No record found." });
  updateBanner = _.assign(updateBanner, _.pick(req.body, ["banner"]));
  updateBanner.banner = req.body.banner;
  updateBanner.updatedAt = new Date().toISOString();
  await updateBanner.save();

  res.status(200).json({ message: "banner updated successfully." });
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;

  const { error } = validationUpdateBanner(req.body);
  if (error) throw error;
  data = await banner.deleteOne({ _id: req.body._id });
  res
    .status(Helper.Statuscode.Success)
    .json({ data: data, message: "banner deleted successfully" });
};

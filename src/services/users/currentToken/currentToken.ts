import { Request, Response } from "express";
import { TokenNo } from "./_validation";

export const list = async (req: Request, res: Response) => {
  let latestToken = await TokenNo.findOne({
    doctorId: req.body.doctorId,
    hospitalId: req.body.hospitalId, // Assuming hid is sent in the request body
    status: true,
  })
    .sort({ _id: -1 }) // Or another field that defines the latest record
    .lean();

  res.status(200).json({ data: latestToken });
};

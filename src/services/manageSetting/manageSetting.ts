import { Request, Response } from "express";
import { ManageSetting } from "./_validation"; // Adjust the import path according to your project structure

export const Addsetting = async (req: Request, res: Response) => {
  let data: any;
  try {
    data = await ManageSetting.create({ ...req.body });
    res.status(200).json({ data, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const get = async (req: Request, res: Response) => {
  let data: any;
  try {
    data = await ManageSetting.find({});
    res.status(200).json({ data, message: "success",status:200});
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const update = async (req: Request, res: Response) => {
  const  _id  =req.body._id;
  let data: any;
  try {
    const existingRecord:any = await ManageSetting.findById({_id:_id});
    if (!existingRecord) {
      return res.status(404).json({ message: "Record not found" });
    }
    Object.assign(existingRecord, req.body);
    data = await existingRecord.save();

    res.status(200).json({ data, message: "success" });
  } catch (error) {
    console.error("Error updating ManageSetting:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import { Request, Response } from "express";
import { FaQTopics, validationUpdateFaQTopics } from "./_validation";
import _ from "lodash";
import Helper from "../../../helper";
let data: any;
export const create = async (req: Request, res: Response) => {
  try{
    data = await FaQTopics.create({
      ...req.body,
      createdAt: new Date().toISOString(),
    });
    res.status(200).json({ data: data, message: "success" });
  }catch(error:any){
    if (error.code === 11000) {  // Duplicate key error
      const duplicateField = Object.keys(error.keyValue)[0];  // Get the field that caused the duplication
       res.status(409).json({
        status: "error",
        message: `Duplicate entry detected for ${duplicateField}`,
        duplicateField: error.keyValue[duplicateField],
      });
  }else{
    res.status(500).json({ message: "Error fetching data", error });
  }
  }
};

export const get = async (req: Request, res: Response) => {
  const searchTerm = req.body.search || ""; 
const status=req.body.status
const payload={}
if(status){
  Object.assign(payload,{status:status})
}
  try {
    const data = await FaQTopics.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } }, // Search by title
            { status: { $regex: searchTerm, $options: "i" } }  // Search by status
          ],
        },
      },{
        $match:payload
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      // You can add additional stages here if needed
    ]);

    res.status(200).json({ data, message: "success", status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error); // Log error for debugging
    res.status(500).json({ message: "Error fetching data", error });
  }
};

export const update = async (req: Request, res: Response) => {
  const { error } = validationUpdateFaQTopics(req.body);
  if (error) throw error;
  try{
    let updateFaQTopics: any = await FaQTopics.findOne({ _id: req.body._id });
    if (!updateFaQTopics)
      return res.status(404).json({ message: "No record found." });
    let payload:any = {};
    payload.updatedAt=new Date()
    Object.assign(payload, { updatedAt: new Date() });
    if (req.body.title)
      Object.assign(payload, { title: req.body.title });
    if (req.body.priority)
      Object.assign(payload, { priority: req.body.priority });
    if (req.body.status  )
        Object.assign(payload, { status: req.body.status });
    data = await FaQTopics.updateOne({ _id: req.body._id }, payload);
    res.status(200).json({ data: data, message: "success" });
  }catch(error:any){
    if (error.code === 11000) {  // Duplicate key error
      const duplicateField = Object.keys(error.keyValue)[0];  // Get the field that caused the duplication
       res.status(409).json({
        status: "error",
        message: `Duplicate entry detected for ${duplicateField}`,
        duplicateField: error.keyValue[duplicateField],
      });
  }
  }


};

export const Delete = async (req: Request, res: Response) => {
  let data: any;

  const { error } = validationUpdateFaQTopics(req.body);
  if (error) throw error;
  data = await FaQTopics.deleteOne({ _id: req.body._id });
  res
    .status(Helper.Statuscode.Success)
    .json({ data: data, message: "success" });
};

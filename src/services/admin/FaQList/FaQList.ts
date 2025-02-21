import { Request, Response } from "express";
import {
  FaQList,
  validationFaQList,
  validationUpdateFaQList,
} from "./_validation";
import _ from "lodash";
import Helper from "../../../helper";
let data: any;
export const create = async (req: Request, res: Response) => {
  const { error } = validationFaQList(req.body);
  if (error) throw error;

  data = await FaQList.findOne({
    priority:req.body.priority
  });

if(   data!=null && Object.keys(data).length>0)
{
   res.status(400).json({ message:"Priority Exists",status: 400});
}
  data = await FaQList.create({
    ...req.body,
    createdAt: new Date().toISOString(),
  });
  res.status(200).json({ data: data, message: "success" , status: 200});
};



export const get = async (req: Request, res: Response) => {
  const searchTerm = req.body.search || ""; 
  const limit = Math.min(Math.max(parseInt(req.body.limit) || 10));
  const offset = Math.max(parseInt(req.body.offset) || 0);
  const payload={}
  const status=req.body.status
  if(status){
    Object.assign(payload,{status:status})
  }
  // const totalCount = await FaQList.countDocuments();
let query: any = {
  $or: [
    { title: { $regex: searchTerm, $options: "i" } },
    { status: { $regex: searchTerm, $options: "i" } },
  ],
};

if (status) {
  // Add the `status` condition only if it is provided
  query.$and = [{ status }];
}

const totalCount = await FaQList.countDocuments(query);

  try {
    const data = await FaQList.aggregate([
      {
        $match: {
       
          $or: [ // Use $or to allow searching by either title or status
            { title: { $regex: searchTerm, $options: "i" } },
            { status: { $regex: searchTerm, $options: "i" } }
          ],
        },
      },
      {
        $match:payload
      },
      {
        $lookup: {
          from: "FaQTopics",           // Collection to join with
          localField: "topicId",       // Field from FaQList
          foreignField: "_id",         // Field from FaQTopics
          as: "topic",                 // Name of the resulting array
        },
      },
      {
        $unwind: {
          path: "$topic"           // Unwind the topic array to deconstruct the single topic
        },
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $skip: offset,
      },
   
      {
        $limit: limit,
      },
    ]);

    res.status(200).json({ data,totalCount, message: "success", status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error); // Log error for debugging
    res.status(500).json({ message: "Error fetching data", error });
  }
};



export const update = async (req: Request, res: Response) => {
  const { error } = validationUpdateFaQList(req.body);
  if (error) throw error;

  try{
    let updateFaQList: any = await FaQList.findOne({ _id: req.body._id });
  if (!updateFaQList)
    return res.status(404).json({ message: "No record found." });
  let payload:any = {};
  payload.updatedAt=new Date()
  if (req.body.title) Object.assign(payload, { title: req.body.title });
  if (req.body.priority)
    Object.assign(payload, { priority: req.body.priority });
  if (req.body.status)
    Object.assign(payload, { status: req.body.status });
  if (req.body.topic) Object.assign(payload, { topicId: req.body.topic });
  if (req.body.description) Object.assign(payload, { description: req.body.description });
  
  Object.assign(payload, { updatedAt: new Date() });
  data = await FaQList.updateOne({ _id: req.body._id }, payload);
  res.status(200).json({ data: data, message: "success" });
  }
catch(error:any){
  if (error.code === 11000) {  
    const duplicateField = Object.keys(error.keyValue)[0];  
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

  const { error } = validationUpdateFaQList(req.body);
  if (error) throw error;
  data = await FaQList.deleteOne({ _id: req.body._id });
  res
    .status(Helper.Statuscode.Success)
    .json({ data: data, message: "success" });
};

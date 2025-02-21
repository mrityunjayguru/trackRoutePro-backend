import { Request, Response } from "express";
import {
  User,
  Vehicle,
  deviceType,
  imeiDb
} from "./_validation";
import _ from "lodash";
import { DownloadExcelForMongoDB } from "../../helper/Scheduler";
import mongoose from "mongoose";

export const downloadUser = async (req: Request, res: Response) => {
  let data: any = await User.aggregate(
   [
    {
      $match:{
        role: "User",
      }
    },
   ]
  );
  let files = await DownloadExcelForMongoDB(data, "UserDetail");

  res.status(200).status(200).json({ data: files, message: "success" });
};

export const downloadAmin = async (req: Request, res: Response) => {
  try {
    let data: any = await User.aggregate(
      [
       {
         $match:{
           role: "Admin",
         }
       },
      ]
     );
  let files = await DownloadExcelForMongoDB(data, "AdminDetail");

    res.status(200).json({ data: files, message: "success", status: 200 });
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

export const downloadDelear = async (req: Request, res: Response) => {
  let data: any = await User.aggregate(
    [
     {
       $match:{
         role: "Dealer",
       }
     },
    ]
   );
  let files = await DownloadExcelForMongoDB(data, "AdminDetail");
  res.status(200).json({ data: files, message: "success", status: 200 });
};

export const downloadDevices = async (req: Request, res: Response) => {
  const payload:any={}
  if(req.body.ownerID)
    Object.assign(payload,{ownerID:new mongoose.Types.ObjectId(req.body.ownerID)})
  let data: any = await Vehicle.aggregate(
    [
     {
       $match:payload
     },
    ]
   );
  let files = await DownloadExcelForMongoDB(data, "Devicedetail");
  res.status(200).json({ data: files, message: "success", status: 200 });
};
export const downloaddeviceTypes = async (req: Request, res: Response) => {
  const payload:any={}
  if(req.body.ownerID)
    Object.assign(payload,{ownerID:new mongoose.Types.ObjectId(req.body.ownerID)})
  let data: any = await deviceType.aggregate(
    [
     {
       $match:payload
     },
    ]
   );
  let files = await DownloadExcelForMongoDB(data, "Devicedetail");
  res.status(200).json({ data: files, message: "success", status: 200 });
};
export const downloadInventry = async (req: Request, res: Response) => {
  const payload:any={}
  if(req.body.ownerID)
    Object.assign(payload,{ownerID:new mongoose.Types.ObjectId(req.body.ownerID)})
  let data: any = await imeiDb.aggregate(
    [
     {
       $match:payload
     },
    ]
   );
  let files = await DownloadExcelForMongoDB(data, "Inventrydetail");
  res.status(200).json({ data: files, message: "success", status: 200 });
};



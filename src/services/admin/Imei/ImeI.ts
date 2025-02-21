import { Request, Response } from "express";
import { Imei, deviceType } from "./_validation";
import _ from "lodash";
import Helper from "../../../helper";
import xlsx from "xlsx";
let data: any;
export const createwithExcel = async (req: any, res: Response) => {
  try {
    let createdCount = 0;
    let duplicateCount = 0;
let total:any=0;
    const getDeviceType = async (val: any) => {
      let devicetypeId: any = await deviceType.findOne({ deviceType: val });
      if (!devicetypeId) {
        duplicateCount++;
      } else {
        return devicetypeId._id;
      }
    };
    // Parse the uploaded Excel file
    const workbook = xlsx.read(req?.files?.excel[0]?.buffer, {
      type: "buffer",
    });
    const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
    const sheet = workbook.Sheets[sheetName];
    const rows: any = xlsx.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const existingData = await Imei.findOne({
        imeiNo: row.ImeiNo,
        deviceId: row.deviceId,
      });

      if (existingData) {
        duplicateCount++;
      } else {
        let id = await getDeviceType(row.deviceType);
        await Imei.create({
          deviceType: id,
          imeiNo: row.ImeiNo,
          deviceId: row.deviceId, // Ensure deviceId is added
          createdAt: new Date().toISOString(),
        });
        createdCount++;
      }
    }
    total=rows.length
    res.status(200).json({
      message: "Excel data uploaded successfully",
      status: 200,
      createdCount,
      duplicateCount,
      total
    });
  } catch (error) {
    console.error("Error uploading Excel file:", error);
    res
      .status(500)
      .json({ message: "Error processing Excel file", status: 500 });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    // Create a new Imei record with the provided data
    const payload = {
      imeiNo: req.body.imei,
      deviceId: req.body.deviceId,
      deviceType: req.body.deviceType,
    };
    const data = await Imei.create(payload);
    res.status(200).json({
      data,
      message: "Success",
      status: 200,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Handle duplicate key error
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        status: "error",
        message: `Duplicate entry detected for ${duplicateField}`,
        duplicateField: duplicateField,
      });
    }

    // Generic error handling
    console.error("Error creating IMEI record:", error);

    res.status(500).json({
      message: "Internal server error",
      status: 500,
      error: error.message || "An unexpected error occurred",
    });
  }
};

export const get = async (req: Request, res: Response) => {
  const searchTerm = req.body.search || "";
  const limit = Math.min(Math.max(parseInt(req.body.limit) || 10));
  const offset = Math.max(parseInt(req.body.offset) || 0);
  const payload = {};
  const filetepayload={}
  // const status = req.body.status || "";
if(req.body.status){
  Object.assign(filetepayload,{assigned:req.body.status})
}
  // const totalCount = await Imei.countDocuments();
  let query: any = {
    $or: [
      { imeiNo: { $regex: searchTerm, $options: "i" } },
      { deviceId: { $regex: searchTerm, $options: "i" } },
      { "deviceType.deviceType": { $regex: searchTerm, $options: "i" } },
    ],
  };

  const totalCount = await Imei.countDocuments(query);
  try {
    const data = await Imei.aggregate([
      {
        $match: payload,
      },
   
      {
        $lookup: {
          from: "deviceType", 
          localField: "deviceType", 
          foreignField: "_id", 
          as: "deviceType", 
        },
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { imeino: "$imeiNo" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$imei", "$$imeino"] }],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "dealerCode",
                foreignField: "_id",
                as: "dealerCode",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "ownerID",
                foreignField: "_id",
                as: "owneriddetail",
              },
            },
         
            {
              $unwind: {
                path: "$owneriddetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$dealerCode",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $unwind: {
          path: "$userDevices", 
          preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $match:query
      },
      {
        $addFields: {
          assigned: { $cond: { if: { $gt: [{ $type: "$userDevices" }, "missing"] }, then: "Assigned", else: "Unassigned" } },
        },
      },
      {
        $unwind: {
          path: "$deviceType", 
          preserveNullAndEmptyArrays: true, 
        },
      },
      {
        $project:{
          "imeiNo":1,
          "deviceId":1,
          "deviceType":1,
          "createdAt":1,
          "assignStatus":1,
          "userDevices.createdAt":1,
          "userDevices.deviceSimNumber":1,
          "userDevices.dealerCode.uniqueCode":1,
          "userDevices.dealerCode.createdAt":1,
          "userDevices.owneriddetail.uniqueCode":1,
          "userDevices.owneriddetail.createdAt":1,
          "assigned":1,
        }
      },
      {
        $match:filetepayload
      },
 
      {
        $sort: { createdAt: -1 }, 
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]);
    res.status(200).json({ data, totalCount, message: "success", status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error); // Log error for debugging
    res.status(500).json({ message: "Error fetching data", error });
  }
};

export const update = async (req: Request, res: Response) => {
  // let updatedBy = {
  //   id: req.body.uid,
  //   time: new Date(),
  // };
  // const payload: any = {
  //   $push: { updatedBy }, 
  //   updatedAt: new Date(), 
  // };
  try {
    let updateImei: any = await Imei.findOne({ _id: req.body._id });
    if (!updateImei)
      return res.status(404).json({ message: "No record found." });
    let payload: any = {};
    payload.updatedAt = new Date();
    if (req.body.imei) Object.assign(payload, { imeiNo: req.body.imei });
    if (req.body.deviceId)
      Object.assign(payload, { deviceId: req.body.deviceId });
    if (req.body.deviceType) Object.assign(payload, { deviceType: req.body.deviceType });
  
    Object.assign(payload, { updatedAt: new Date() });
    data = await Imei.updateOne({ _id: req.body._id }, payload);
    res.status(200).json({ data: data, message: "success" });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      const duplicateField = Object.keys(error.keyValue)[0]; // Get the field that caused the duplication
      res.status(409).json({
        status: "error",
        message: `Duplicate entry detected for ${duplicateField}`,
        duplicateField: error.keyValue[duplicateField],
      });
    }else{
      res.status(500).json({
        status: "error",
        message: `Internal server error`
      });  
    }
  }
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;

  data = await Imei.deleteOne({ _id: req.body._id });
  res
    .status(Helper.Statuscode.Success)
    .json({ data: data, message: "success" });
};

import { Request, Response } from "express";
import { Vehicle, renewRequest, cashingAlearts } from "./_validation";
import _ from "lodash";
import mongoose from "mongoose";

export const create = async (req: Request, res: Response) => {
  try {
    const {
      dataFiltrationLevel,
      tankCapacity,
      minimumValue,
      fillDifference,
      maximumValue,
      drainDifference,
      deviceId,
      imei,
      vehicleNo,
      ownerID,
      deviceStatus,
      displayParameters,
      delearid,
      fuel,
      vehicleType,
      deviceType,
      deviceSimNumber,
      dealerCode,
      status,
      fuleOutput,
      operator,
      isAppCreated,
    } = req.body;
    let createdBy = {
      id: req.body.uid,
    };
    // Check if the vehicle already exists based on deviceId, imei, or vehicleNo
    const existingVehicle: any = await Vehicle.findOne({
      imei: imei,
    });

    if (existingVehicle) {
      if (existingVehicle.imei === imei) {
        return res.status(400).json({ message: "IMEI Already Exists." });
      }
    }

    // Prepare the vehicle data to create a new record
    const newVehicle: any = new Vehicle({
      deviceId,
      imei,
      vehicleNo,
      operator,
      ownerID,
      deviceStatus,
      dataFiltrationLevel,
      tankCapacity,
      minimumValue,
      fillDifference,
      maximumValue,
      drainDifference,
      fuleOutput,
      delearid,
      displayParameters,
      fuel,
      vehicleType,
      deviceType,
      deviceSimNumber,
      dealerCode,
      status,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAppCreated,
    });
    // Save the new vehicle document
    const savedVehicle = await newVehicle.save();
    await cashingAlearts.create({
      ...req.body,
      deviceDetail: savedVehicle._id,
    });
    // Send success response
    res.status(200).json({ data: savedVehicle, message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const get = async (req: Request, res: Response) => {
  let data: any;
  data = await Vehicle.find({ ownerID: req.body.ownerid });
  res.status(200).json({ data: data, message: "success", status: 200 });
};

export const getByid = async (req: Request, res: Response) => {
  let data: any;
  let payload = {};
  if (req.body._id) Object.assign(payload, { _id: req.body._id });
  data = await Vehicle.findOne(payload);
  res.status(200).json({ data: data, message: "success" });
};
export const devicesByOwnerID = async (req: Request, res: Response) => {
  let data: any;
  const limit = Math.min(Math.max(parseInt(req.body.limit) || 10));
  const offset = Math.max(parseInt(req.body.offset) || 0);
  let payload = {
    // status: "Active",
  };
  if (req.body._id)
    Object.assign(payload, {
      ownerID: new mongoose.Types.ObjectId(req.body._id),
    });
  if (req.body.isAppCreated)
    Object.assign(payload, { isAppCreated: req.body.isAppCreated });
  const totalCount = await Vehicle.countDocuments(payload);
  data = await Vehicle.aggregate([
    {
      $match: payload,
    },
    {
      $lookup: {
        from: "vehicleType",
        localField: "vehicleType",
        foreignField: "_id",
        as: "vehicleTypeDetails",
      },
    },
    {
      $lookup: {
        from: "Imei",
        localField: "imei",
        foreignField: "imeiNo",
        as: "imediDetail",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "ownerID",
        foreignField: "_id",
        as: "ownerIDDetail",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "dealerCode",
        foreignField: "_id",
        as: "dealerdetail",
      },
    },
    {
      $unwind: "$dealerdetail",
    },
    {
      $unwind: "$ownerIDDetail",
    },
    {
      $unwind: "$imediDetail",
    },
    {
      $lookup: {
        from: "deviceType",
        localField: "imediDetail.deviceType",
        foreignField: "_id",
        as: "deviceTypeRecord",
      },
    },
    {
      $unwind: "$deviceTypeRecord",
    },
    {
      $unwind: "$vehicleTypeDetails",
    },
    // {
    //   $project:{
    //     vehicleNo:1,
    //     imei:1,
    //     deviceSimNumber:1,
    //     operator:1,
    //     status:1,
    //     createdAt:1,
    //     "dealerCodeRecord.Name":1,
    //     "dealerCodeRecord.uniqueCode":1,
    //     "ownerIDDetail.Name":1,
    //     "ownerIDDetail.uniqueCode":1,
    //   }
    // },
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
  res
    .status(200)
    .json({
      data: data,
      totalCount: totalCount,
      message: "success",
      status: 200,
    });
};
export const update = async (req: Request, res: Response) => {
  try {
    // Validate the incoming request data
    // const { error } = Vehicleupdate(req.body);
    // if (error) {
    //   return res.status(400).json({ message: error });
    // }

    // Find the existing vehicle
    const vehicle = await Vehicle.findById(req.body._id);
    if (!vehicle) {
      return res.status(404).json({ message: "No record found." });
    }

    // Prepare the update payload
    let payload = {};
    Object.assign(payload, { updatedAt: new Date() });
    if (req.body.deviceId)
      Object.assign(payload, { deviceId: req.body.deviceId });
    if (req.body.locationStatus == true || req.body.locationStatus == false)
      Object.assign(payload, { locationStatus: req.body.locationStatus });
    if (req.body.speedStatus == true || req.body.speedStatus == false)
      Object.assign(payload, { speedStatus: req.body.speedStatus });
    if (req.body.imei) Object.assign(payload, { imei: req.body.imei });
    if (req.body.ownerID) Object.assign(payload, { ownerID: req.body.ownerID });
    if (req.body.deviceStatus)
      Object.assign(payload, { status: req.body.deviceStatus });
    if (req.body.vehicleNo)
      Object.assign(payload, { vehicleNo: req.body.vehicleNo });
    if (req.body.vehicleType)
      Object.assign(payload, { vehicleType: req.body.vehicleType });
    if (req.body.vehicleRegistrationNo)
      Object.assign(payload, {
        vehicleRegistrationNo: req.body.vehicleRegistrationNo,
      });
    if (req.body.driverName)
      Object.assign(payload, { driverName: req.body.driverName });
    if (req.body.mobileNo)
      Object.assign(payload, { mobileNo: req.body.mobileNo });
    if (req.body.vehicleBrand)
      Object.assign(payload, { vehicleBrand: req.body.vehicleBrand });
    if (req.body.vehicleModel)
      Object.assign(payload, { vehicleModel: req.body.vehicleModel });
    if (req.body.insuranceExpiryDate)
      Object.assign(payload, {
        insuranceExpiryDate: req.body.insuranceExpiryDate,
      });
    if (req.body.pollutionExpiryDate)
      Object.assign(payload, {
        pollutionExpiryDate: req.body.pollutionExpiryDate,
      });
    if (req.body.fitnessExpiryDate)
      Object.assign(payload, { fitnessExpiryDate: req.body.fitnessExpiryDate });
    if (req.body.nationalPermitExpiryDate)
      Object.assign(payload, {
        nationalPermitExpiryDate: req.body.nationalPermitExpiryDate,
      });
    if (req.body.fuelStatus)
      Object.assign(payload, {
        fuelStatus: req.body.fuelStatus,
      });
    if (req.body.subscriptionexp)
      Object.assign(payload, {
        subscriptionexp: req.body.subscriptionexp,
      });
    if (req.body.subscriptiostart)
      Object.assign(payload, {
        subscriptiostart: req.body.subscriptiostart,
      });
    if (req.body.maxSpeed)
      Object.assign(payload, {
        maxSpeed: req.body.maxSpeed,
      });
    if (req.body.parking == true || req.body.parking == false)
      Object.assign(payload, {
        parking: req.body.parking,
      });
    if (req.body.location)
      Object.assign(payload, {
        location: req.body.location,
      });
    if (req.body.Area)
      Object.assign(payload, {
        Area: req.body.Area,
      });
    if (req.body.dealerCode)
      Object.assign(payload, {
        dealerCode: req.body.dealerCode,
      });
    if (req.body.deviceSimNumber)
      Object.assign(payload, {
        deviceSimNumber: req.body.deviceSimNumber,
      });
    if (req.body.deviceType)
      Object.assign(payload, {
        deviceType: req.body.deviceType,
      });
    if (req.body.displayParameters)
      Object.assign(payload, {
        displayParameters: req.body.displayParameters,
      });
    if (req.body.operator)
      Object.assign(payload, {
        operator: req.body.operator,
      });
    if (req.body.output)
      Object.assign(payload, {
        output: req.body.output,
      });
    if (req.body.fuleOutput)
      Object.assign(payload, {
        fuleOutput: req.body.fuleOutput,
      });

    if (req.body.tankCapacity)
      Object.assign(payload, {
        tankCapacity: req.body.tankCapacity,
      });
    if (req.body.minimumValue)
      Object.assign(payload, {
        minimumValue: req.body.minimumValue,
      });
    if (req.body.fillDifference)
      Object.assign(payload, {
        fillDifference: req.body.fillDifference,
      });
    if (req.body.dataFiltrationLevel)
      Object.assign(payload, {
        dataFiltrationLevel: req.body.dataFiltrationLevel,
      });
    if (req.body.maximumValue)
      Object.assign(payload, {
        maximumValue: req.body.maximumValue,
      });
    if (req.body.drainDifference)
      Object.assign(payload, {
        drainDifference: req.body.drainDifference,
      });
    await Vehicle.updateOne({ _id: req.body._id }, payload);

    let data: any = await Vehicle.findOne({ _id: req.body._id });
    const payload2 = {};
    if (req.body.imei) Object.assign(payload2, { imei: req.body.imei });

    await cashingAlearts.updateOne({ deviceDetail: req.body._id }, payload2);

    res.status(200).json({ data: data, message: "Update successful." });
  } catch (error: any) {
    console.log(error, "error");
    if (error.code === 11000) {
      // Duplicate key error
      const duplicateField = Object.keys(error.keyValue)[0]; // Get the field that caused the duplication
      res.status(409).json({
        status: "error",
        message: `Duplicate entry detected for ${duplicateField}`,
        duplicateField: error.keyValue[duplicateField],
      });
    } else {
      res.status(500).json({
        status: "error",
        message: `Internal server error`,
        error,
      });
    }
  }
};
export const Delete = async (req: Request, res: Response) => {
  let data: any;
  const vehicles: any = await Vehicle.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }
  if (vehicles.status == false) {
    return res.status(409).json({ message: "Not Authrized to delete Record." });
  }

  data = await Vehicle.deleteOne({ _id: req.body._id });
  res.status(200).json({ data: data, message: "Vehicle Deleted successfully" });
};

export const updateMany = async (req: Request, res: Response) => {
  let data: any;

  let payload: any = {};
  if (req.body.subscriptionexp)
    Object.assign(payload, {
      subscriptionexp: req.body.subscriptionexp,
    });
  if (req.body.subscriptiostart)
    Object.assign(payload, {
      subscriptiostart: req.body.subscriptiostart,
    });
  await Vehicle.updateMany({ imei: req.body.deviceId }, payload);

  res.status(200).json({ data: data, message: "Vehicle Deleted successfully" });
};

export const expVehicle = async (req: Request, res: Response) => {
  let successcount: number = 0;
  let failcount: number = 0;
  let totalrecord: number = req.body.imei.length;

  const records = req.body.imei;

  for (let i = 0; i < records.length; i++) {
    // Find the record by imei
    let data: any = await renewRequest.findOne({ imei: records[i] ,createdBy:req.body.uid});
    // If the data doesn't exist, create a new record
    if (!data) {
      successcount++; // Increment success count if a new record was created
      await renewRequest.create({ imei: records[i] });
    } else {
      const createdAt = new Date(data.createdAt);
      const currentDate = new Date();

      // Calculate the difference in milliseconds
      const differenceInMilliseconds =
        currentDate.getTime() - createdAt.getTime();

      // If the difference is greater than 24 hours, create a new record
      if (differenceInMilliseconds > 86400000) {
        await renewRequest.create({ imei: records[i],createdBy:req.body.uid }); // Create a new record
        successcount++; // Increment success count
      } else {
        failcount++; // Increment fail count if the condition isn't met
      }
    }
  }
  let ndata = {
    successcount,
    failcount,
    totalrecord,
  };
  // Return a response with success and failure counts
  return res.status(200).json({
    data: ndata,
    message: "Operation completed successfully",
    status: 200,
  });
};




export const getRenewRequest = async (req: Request, res: Response) => {
  try {
    let payload: any = {};

    if (req.body.subscriptionexp) {
      payload.subscriptionexp = req.body.subscriptionexp;
    }
    if (req.body.subscriptiostart) {
      payload.subscriptiostart = req.body.subscriptiostart;
    }

    const data = await renewRequest.aggregate([
      { $match: payload },
      {
        $lookup: {
          from: "Imei",
          localField: "imei",  
          foreignField: "imeiNo", 
          as: "imeiDetail",
        },
      },
      {
        $lookup: {
          from: "UserDevices",
          localField: "imei",  
          foreignField: "imei", 
          as: "deviceDetail",
        },
      },
      {
        $unwind:"$imeiDetail"
      },
      {
        $unwind:"$deviceDetail"
      }
    ]);

    res.status(200).json({ data, message: "Renew request retrieved successfully" });
  } catch (error) {
    console.error("Error fetching renew request:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

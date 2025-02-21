import { Request, Response } from "express";
import {
  tracking,
  Vehicleupdate,
  Device,
  users,
  alearts,
  cashingAlearts,
  VehicletrackingLogs,
  createSummary,
} from "./_validation";
const moment = require("moment");
import Helper from "../../../../helper";
import _ from "lodash";
import { UploadAndcreateExcelFile } from "../../../../helper/Scheduler";
const mongoose = require("mongoose");
const geolib = require("geolib");
let AllPermission:any;
// import {io,users } from "../../../socket";
// import { io,socketUser } from "../../../../socket";

export const create = async (req: Request, res: Response) => {
  try {
    let records: any = await tracking.create({
      ...req.body
    });
    await VehicletrackingLogs.create({
      ...req.body
    });

    // Send success response
    await sendPushNotification(req.body, records._id);

    res.status(200).json({ message: "Success" });
  } catch (Err) {
    // console.log(Err);
  }
};
export const get = async (req: Request, res: Response) => {
  let data: any;
  data = await tracking.find({});
  res.status(200).json({ data: data, message: "success", status: 200 });
};

export const getByVehicleID = async (req: Request, res: Response) => {
  let data: any;
  let payload = {};

  // Build the match payload
  if (req.body.deviceId) Object.assign(payload, { imei: req.body.deviceId });
  if (req.body.ownerId) {
    Object.assign(payload, {
      ownerID: new mongoose.Types.ObjectId(req.body.ownerId),
    });
  }
  if (req.body.startdate) {
    Object.assign(payload, { dateFiled: req.body.startdate });
  }
  if (req.body.enddate) {
    Object.assign(payload, { dateFiled: req.body.enddate });
  }
  if (req.body.starttime) {
    Object.assign(payload, { dateFiled: req.body.starttime });
  }
  if (req.body.enddimt) {
    Object.assign(payload, { dateFiled: req.body.enddimt });
  }

  data = await Device.aggregate([
    {
      $match: payload, 
    },
    {
      $lookup: {
        from: "Vehicletracking",
        let: { tracking: "$imei" }, 
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$deviceIMEI", "$$tracking"] }], 
              },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $limit: 1,
          },
        ],
        as: "trackingData",
      },
    },
    {
      $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "renewRequest",
        let: { tracking: "$imei" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$imei", "$$tracking"] }], // Match imei with the tracking variable
              },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $limit: 1,
          },
        ],
        as: "AllRreadyApplied",
      },
    },
    {
      $unwind: { path: "$AllRreadyApplied", preserveNullAndEmptyArrays: true },
    },
    {
      $addFields: {
        hoursDifference: {
          $divide: [
            { $subtract: [new Date(), "$AllRreadyApplied.createdAt"] },
            60 * 60 * 1000,
          ],
        },
      },
    },

    {
      $lookup: {
        from: "vehicleType",
        localField: "vehicleType",
        foreignField: "_id",
        as: "vehicletype",
      },
    },
    {
      $unwind: { path: "$vehicletype", preserveNullAndEmptyArrays: true },
    },

    {
      $addFields: {
        dateFiled: {
          $dateToString: {
            format: "%Y-%m-%d %H:%M:%S",
            date: "$trackingData.createdAt",
            timezone: "Asia/Kolkata", // Convert to Indian Standard Time
          },
        },
      },
    },
    {
      $addFields: {
        fuelLevel: {
          $cond: {
            if: {
              $eq: [{ $trim: { input: "$fuleOutput" } }, "Anolage/Voltage"],
            },
            then: {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: [
                        { $toDouble: "$trackingData.fuel" },
                        { $toDouble: "$minimumValue" },
                      ],
                    },
                    {
                      $subtract: [
                        { $toDouble: "$maximumValue" },
                        { $toDouble: "$minimumValue" },
                      ],
                    },
                  ],
                },
                { $toDouble: "$tankCapacity" },
              ],
            },
            else: "$trackingData.fuel",
          },
        },
      },
    },
  ]);
  let summary: any = {};

  if (req.body.deviceId) {
    let matchfilter: any = {};

    const twentyFourHoursAgo = moment().subtract(24, "hours").format("YYYY-MM-DD");

    // let mydate: any = formatDate(twentyFourHoursAgo);
    Object.assign(matchfilter, { createdAt: { $gte: new Date(twentyFourHoursAgo) } });

    let logs: any = await VehicletrackingLogs.find({
      deviceIMEI: req.body.deviceId,
      "ignition.status": true,
      currentSpeed: { $gt: 0 },
      createdAt: { $gte: twentyFourHoursAgo },
    });
    if (logs.length > 0) {
      let totalDistance = logs.reduce((distance: any, log: any, index: any) => {
        if (index < logs.length - 1) {
          return (
            distance +
            geolib.getDistance(log.location, logs[index + 1].location)
          );
        }
        return distance;
      }, 0);

      let latesttripOn: any = await createSummary.aggregate([
        {
          $match: {
            imei: req.body.deviceId
          },
        },
        {
          $match: matchfilter,
        },
        { $sort: { createdAt: -1 } },
        {
          $limit: 3,
        },
      ]);
      let newval:any=[]

      if (latesttripOn.length > 0 && latesttripOn[0]?.igitionOn === true) {
          // Push the next two records if they exist
          for (let i = 1; i < Math.min(3, latesttripOn.length); i++) {
              newval.push(latesttripOn[i]);
          }
      } else {
          // If the first record is not igitionOn, push all records
          for (let i = 0; i < latesttripOn.length; i++) {
              newval.push(latesttripOn[i]);
          }
      }

      let totalTripDistance = newval.reduce(
        (distance: any, log: any, index: any) => {
          if (index < logs.length - 1) {
            return (
              distance +
              geolib.getDistance(log.location, logs[index + 1].location)
            );
          }
          return distance;
        },
        0
      );

      summary.latest_trip_km = totalTripDistance / 1000;
      summary.total_travel_km = totalDistance / 1000;

      // Calculate trip time
      let startTime = newval[1].createdAt;
      let endTime = newval[0].createdAt;
      let diffInMillis = endTime - startTime;

      let diffInHours = Math.floor(diffInMillis / (1000 * 60 * 60));
      let diffInMinutes = Math.floor(
        (diffInMillis % (1000 * 60 * 60)) / (1000 * 60)
      );
      if (diffInHours >= 24) {
        summary.latest_trip_time = "00:00";
    } else {
        summary.latest_trip_time = `${diffInHours}H ${diffInMinutes}M`;
    }

      // Fetch max speed
      let maxSpeedRecord: any = await VehicletrackingLogs.findOne({
        deviceIMEI: req.body.deviceId,
        "ignition.status": true,
        createdAt: { $gte: twentyFourHoursAgo },
      })
        .sort({ currentSpeed: -1 }) // Sort descending to get the highest speed
        .limit(1);
      if (maxSpeedRecord) {
        summary.max_speed = maxSpeedRecord.currentSpeed;
        summary.max_speed_time = maxSpeedRecord.createdAt;
        summary.max_speed_location = maxSpeedRecord.location;
      }

      // Calculate average speed
      let avgSpeedData: any = await VehicletrackingLogs.aggregate([
        {
          $match: {
            deviceIMEI: req.body.deviceId,
            // createdAt: { $gt: twentyFourHoursAgo },
          },
        },
        {
          $group: {
            _id: null,
            averageSpeed: { $avg: "$currentSpeed" },
          },
        },
      ]);

      if (avgSpeedData.length > 0) {
        summary.avg_speed = avgSpeedData[0].averageSpeed.toFixed(2);
      }

      // Calculate total travel time
      let totalTimeLogs: any = await VehicletrackingLogs.find({
        deviceIMEI: req.body.deviceId,
        "ignition.status": true,
        currentSpeed: { $gt: 0 },
        createdAt: { $gte: twentyFourHoursAgo },
      });

      if (totalTimeLogs.length > 0) {
        let totalStartTime = totalTimeLogs[0].createdAt;
        let totalEndTime = totalTimeLogs[totalTimeLogs.length - 1].createdAt;
        let totalDiffInMillis = totalEndTime - totalStartTime;

        let totalHours = Math.floor(totalDiffInMillis / (1000 * 60 * 60));
        let totalMinutes = Math.floor(
          (totalDiffInMillis % (1000 * 60 * 60)) / (1000 * 60)
        );
        // let totalSeconds = Math.floor((totalDiffInMillis % (1000 * 60)) / 1000);
        summary.total_travel_time = `${totalHours}H ${totalMinutes}M`;
      }
    }
    Object.assign(data[0], { summary: summary });
  }

  res.status(200).json({ data: data, message: "success", status: 200 });
};

export const rootHistory = async (req: Request, res: Response) => {
  let data: any;
  let payload = { status: "Active" };
  let datefilterpayload: any = {};
  const timefilterpayload: any = {};

  if (req.body.imei) {
    Object.assign(payload, { imei: req.body.imei });
  }
  // Build the date filter if start or end date is provided
  if (req.body.startdate) {
    Object.assign(datefilterpayload, { $gte: req.body.startdate });
  }
  if (req.body.enddate) {
    Object.assign(datefilterpayload, { $lte: req.body.enddate });
  }
  // Build the time filter if start or end time is provided
  if (req.body.starttime) {
    Object.assign(timefilterpayload, { $gte: req.body.starttime });
  }
  if (req.body.endtime) {
    Object.assign(timefilterpayload, { $lte: req.body.endtime });
  }
  // Conditional filter logic to combine date and time if both are provided
  let finalDateMatch: any = { dateFiled: datefilterpayload };
  // Query 1
  // let data1 = await Device.aggregate([
  //   { $match: payload },
  //   {
  //     $lookup: {
  //       from: "Vehicletracking",
  //       let: { tracking: "$imei" },
  //       pipeline: [
  //         {
  //           $match: {
  //             $expr: { $eq: ["$deviceIMEI", "$$tracking"] },
  //           },
  //         },
  //       ],
  //       as: "trackingData",
  //     },
  //   },

  //   { $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "vehicleType",
  //       localField: "vehicleType",
  //       foreignField: "_id",
  //       as: "vehicletype",
  //     },
  //   },
  //   { $unwind: { path: "$vehicletype", preserveNullAndEmptyArrays: true } },
  //   {
  //     $addFields: {
  //       dateFiled: {
  //         $dateToString: {
  //           format: "%Y-%m-%d %H:%M:%S",
  //           date: "$trackingData.createdAt",
  //           timezone: "Asia/Kolkata",
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $match: finalDateMatch, // Match based on date and time filters
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       imei: 1,
  //       "vehicletype.icons": 1,
  //       "vehicletype.vehicleTypeName": 1,
  //       "trackingData.course": 1,
  //       "trackingData.ignition": 1,
  //       "trackingData.location": 1,
  //       "trackingData.createdAt": 1,
  //       "trackingData.currentSpeed": 1,
  //       dateFiled: 1,
  //     },
  //   },
  // ]);

  // Query 2
  let data2 = await Device.aggregate([
    { $match: payload },
    {
      $lookup: {
        from: "VehicletrackingLogs",
        let: { tracking: "$imei" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$deviceIMEI", "$$tracking"] },
            },
          },
        ],
        as: "trackingData",
      },
    },
    { $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "vehicleType",
        localField: "vehicleType",
        foreignField: "_id",
        as: "vehicletype",
      },
    },
    { $unwind: { path: "$vehicletype", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        dateFiled: {
          $dateToString: {
            format: "%Y-%m-%d %H:%M:%S",
            date: "$trackingData.createdAt",
            timezone: "Asia/Kolkata",
          },
        },
      },
    },
    {
      $match: finalDateMatch, // Match based on date and time filters
    },
    {
      $project: {
        _id: 0,
        imei: 1,
        "vehicletype.icons": 1,
        "vehicletype.vehicleTypeName": 1,
        "trackingData.course": 1,
        "trackingData.ignition": 1,
        "trackingData.location": 1,
        "trackingData.createdAt": 1,
        "trackingData.currentSpeed": 1,
        dateFiled: 1,
      },
    },
  ]);

  data = [...data2];
  res.status(200).json({ data: data, message: "success", status: 200 });
};

export const update = async (req: Request, res: Response) => {
  // Validate the incoming request data
  const { error } = Vehicleupdate(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  // Find the existing vehicle
  const vehicles: any = await tracking.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }

  // Prepare the data to be updated
  const vehicleData = _.pick(req.body, [
    "vehicleRegistrationNo",
    "dateAdded",
    "name",
    "mobileNo",
    "vehicleType",
    "vehicleBrand",
    "vehicleModel",
    "insuranceExpiryDate",
    "pollutionExpiryDate",
    "fitnessExpiryDate",
    "nationalPermitExpiryDate",
  ]);

  Object.assign(vehicles, vehicleData); // Or vehicle.set(vehicleData)
  vehicles.updatedAt = new Date().toISOString(); // Optionally track when the vehicle was updated

  const updatedVehicle = await vehicles.save();

  res
    .status(200)
    .json({ data: updatedVehicle, message: "Vehicle updated successfully" });
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;
  const vehicles: any = await tracking.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }
  if (vehicles.status == false) {
    return res.status(409).json({ message: "Not Authrized to delete Record." });
  }

  data = await tracking.deleteOne({ _id: req.body._id });
  res.status(200).json({ data: data, message: "Vehicle Deleted successfully" });
};

export const searchuser = async (req: Request, res: Response) => {
  let data: any;
  const searchTerm = req.body.search || "";
  const payload: any = { role: "User" };

  try {
    data = await users.aggregate([
      {
        $match: payload,
      },
      {
        $match: {
          $or: [{ Name: { $regex: searchTerm, $options: "i" } }],
        },
      },
      {
        $project: {
          _id: 1,
          Name: "$Name", // Use $Name to project the correct field
          userID: "$_id", // Assuming userID corresponds to _id
        },
      },
    ]);

    res.status(200).json({ data: data, message: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchDevices = async (req: Request, res: Response) => {
  let data: any;
  const searchTerm = req.body.search || "";

  try {
    data = await Device.aggregate([
      {
        $match: {
          status: "Active",
          $or: [
            { deviceId: { $regex: searchTerm, $options: "i" } },
            { imei: { $regex: searchTerm, $options: "i" } },
            { vehicleRegistrationNo: { $regex: searchTerm, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          imei: 1, // Use $Name to project the correct field
        },
      },
    ]);

    res.status(200).json({ data: data, message: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Alerts = async (req: Request, res: Response) => {
  try {
    const payload: any = {};
    // Validate ownerId if provided
    if (req.body.ownerID && mongoose.Types.ObjectId.isValid(req.body.ownerID)) {
      Object.assign(payload, {
        ownerID: new mongoose.Types.ObjectId(req.body.ownerID),
      });
    }
    const project = {
      location: 1,
      course: 1,
      status: 1,
      currentSpeed: 1,
      externalBattery: 1,
      internalBattery: 1,
      dailyDistance: 1,
      gps: 1,
      door: 1,
      ignition: 1,
      ac: 1,
      fuelGauge: 1,
      createdAt: 1,
    };
    const projectvehicle = {
      vehicleTypeName: 1,
    };
    const vehicles: any = await Device.aggregate([
      {
        $match: payload,
      },
      {
        $project: {
          fuel: 1,
          deviceId: 1,
          ownerID: 1,
          vehicleType: 1,
          vehicleNo: 1,
          maxSpeed: 1,
          parking: 1,
          parkingSpeed: 1,
          location: 1,
          Area: 1,
        },
      },
      {
        $lookup: {
          from: "Vehicletracking",
          let: { tracking: "$deviceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deviceID", "$$tracking"] }],
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
            {
              $project: project,
            },
          ],
          as: "trackingData",
        },
      },
      {
        $lookup: {
          from: "vehicleType",
          let: { vehicle: "$vehicleType" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$vehicle"] }],
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
            {
              $project: projectvehicle,
            },
          ],
          as: "vehicleDetails",
        },
      },
      { $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: "$vehicleDetails", preserveNullAndEmptyArrays: true },
      },
    ]);

    res.status(200).json({ data: vehicles, message: "success" });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({
      message: "An error occurred while fetching vehicles",
      error: error,
    });
  }
};

const sendPushNotification = async (records: any, _id: any) => {
  let data: any;
  try {
    data = await Device.aggregate([
      {
        $match: {
          imei: records.deviceIMEI, // Match device based on the deviceId
        },
      },
      {
        $lookup: {
          from: "Vehicletracking",
          let: { tracking: "$imei" }, // Define variable for deviceId
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$deviceIMEI", "$$tracking"] }], // Match deviceID with the tracking variable
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
          ],
          as: "trackingData",
        },
      },
      {
        $unwind: { path: "$trackingData", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          fuelLevel: {
            $cond: {
              if: {
                $eq: [{ $trim: { input: "$fuleOutput" } }, "Anolage/Voltage"],
              },
              then: {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          { $toDouble: "$trackingData.fuel" },
                          { $toDouble: "$minimumValue" },
                        ],
                      },
                      {
                        $subtract: [
                          { $toDouble: "$maximumValue" },
                          { $toDouble: "$minimumValue" },
                        ],
                      },
                    ],
                  },
                  { $toDouble: "$tankCapacity" },
                ],
              },
              else: "$trackingData.fuel",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ownerID",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $lookup: {
          from: "cashingAlearts",
          localField: "imei",
          foreignField: "imei",
          as: "Alearts",
        },
      },
      {
        $unwind: "$Alearts", // Unwind the user data for easier access
      },
      {
        $unwind: "$result", // Unwind the user data for easier access
      },
      {
        $project: {
          "result.firebaseToken": 1,
          "result.notificationPermission": 1,
          Alearts: 1,
          fillDifference: 1,
          drainDifference: 1,
          vehicleNo: 1,
          deviceId: 1,
          imei: 1,
          ownerID: 1,
          maxSpeed: 1,
          parking: 1,
          parkingSpeed: 1,
          Area: 1,
          location: 1,
          driverName: 1,
          fuelLevel: 1,
        },
      },
    ]);
    // const user = socketUser.find(user => user.userId === 'All');
    // console.log(user,"useruseruser")
    // if (user) {
    //   io.to(user.socketId).emit('message', records); // Emit message to the user's socket
    // }
    // cashingAlearts
    if (data && data.length > 0) {
      let newRecords = data[0];
      console.log(newRecords?.result?.notificationPermission?.all,"newRecords?.notificationPermission?.all")
      AllPermission=newRecords?.result?.notificationPermission?.all;

      var sendPermission: any;
      // console.log(newRecords,"newRecordsnewRecords")
      var updatepayload: any = {};
      if (
        (records.ignition.status === true ||
          records.ignition.status === "true") &&
        newRecords?.Alearts?.ininiousOn === true
      ) {
        sendPermission = newRecords?.result?.notificationPermission?.Ignition;
        updatepayload.ininiousOn = false;
        updatepayload.ininiousOf = true;
        await createSummary.create({
          imei: newRecords?.imei,
          igitionOn: true,
          location: records.location,
        });
        const notificationPayload = {
          notification: {
            title: `Ignition On`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,

        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Ignition",
          sendPermission
        );
      }
      if (
        (records.ignition.status === false ||
          records.ignition.status === "false") &&
        newRecords?.Alearts?.ininiousOf === true
      ) {
        await createSummary.create({
          imei: newRecords?.imei,
          igitionOF: false,
          location: records.location,
        });
        sendPermission = newRecords?.result?.notificationPermission?.Ignition;

        updatepayload.ininiousOf = false;
        updatepayload.ininiousOn = true;
        updatepayload.maxSpeed = true;
        updatepayload.lessSpeed = false;
        updatepayload.acOn = true;
        updatepayload.acOf = false;
        const notificationPayload = {
          notification: {
            title: `Ignition Off`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,

        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Ignition",
          sendPermission
        );
      }

      // Check Speed Limit Exceeded
      if (
        Number(records.currentSpeed) > Number(newRecords?.maxSpeed) 
      ) {
        sendPermission = newRecords?.result?.notificationPermission?.Over_Speed;

        updatepayload.maxSpeed = false;
        updatepayload.lessSpeed = true;
        const notificationPayload = {
          notification: {
            title: `ALERT:Speed Limit Exceeded!`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,
       
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Speed",
          sendPermission
        );
      }

      // Speed Alert in Parking Zone
      if (
        newRecords?.parking === true &&
        records.currentSpeed > 3 
      ) {
        sendPermission =
          newRecords?.result?.notificationPermission?.Parking_Alert;

        const notificationPayload = {
          notification: {
            title: `ALERT:Speed in Parking Zone!`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,
       
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "parking",
          sendPermission
        );
      }

      // Door Open Alert
      if (
        records.door === true &&
        newRecords?.Alearts?.doorOpne == true 
      ) {
        updatepayload.doorClose = true;
        updatepayload.doorOpne = false;
        sendPermission =
          newRecords?.result?.notificationPermission?.AC_Door_Alert;

        const notificationPayload = {
          notification: {
            title: `Door Open!`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,

        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "door",
          sendPermission
        );
      }
      if (
        records.door === false &&
        newRecords?.Alearts?.doorClose === true 
      ) {
        updatepayload.doorClose = false;
        updatepayload.doorOpen = true;
        sendPermission =
          newRecords?.result?.notificationPermission?.AC_Door_Alert;

        const notificationPayload = {
          notification: {
            title: `Door Closed`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,
 // User's Firebase token
        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "door",
          sendPermission
        );
      }

      if (
        records.ac === true &&
        newRecords?.Alearts?.acOn === true
      ) {
        updatepayload.acOn = false;
        updatepayload.acOf = true;
        sendPermission =
          newRecords?.result?.notificationPermission?.AC_Door_Alert;

        const notificationPayload = {
          notification: {
            title: `Air Conditioning On!`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,

        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "ac",
          sendPermission
        );
      }
      if (
        records.ac === false &&
        newRecords?.Alearts?.acOf === true 
      ) {
        updatepayload.acOn = true;
        updatepayload.acOf = false;
        sendPermission =
          newRecords?.result?.notificationPermission?.AC_Door_Alert;

        const notificationPayload = {
          notification: {
            title: `Air Conditioning Off`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,

        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "ac",
          sendPermission
        );
      }

      if (
        records.internalBattery < 30 
      ) {
        sendPermission =
          newRecords?.result?.notificationPermission?.Device_Low_Battery;

        const notificationPayload = {
          notification: {
            title: `Low Battery`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,

        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Battery",
          sendPermission
        );
      }
      if (
        records.externalBattery == 0 
      ) {
        sendPermission =
          newRecords?.result?.notificationPermission?.Device_Power_Cut;

        const notificationPayload = {
          notification: {
            title: `Power Cut`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,

        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Battery",
          sendPermission
        );
      }
      if (records.externalBattery == 13) {
        const notificationPayload = {
          notification: {
            title: `Power Restore`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,

        };
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Battery",
          sendPermission
        );
      }
      if (
        newRecords.fuelLevel 
      ) {
        if (
          newRecords?.Alearts?.fuelLevel - newRecords.fuelLevel >=
          parseInt(newRecords.fillDifference)
        ) {
          sendPermission =
            newRecords?.result?.notificationPermission?.Fuel_Alert;

          const notificationPayload = {
            notification: {
              title: `Fuel Alert Decrease`,
              body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
            },
            token: newRecords.result.firebaseToken,

          };
          await sendNotification(
            notificationPayload,
            newRecords.ownerID,
            records.deviceIMEI,
            _id,
            records.location,
            "Fuel",
            sendPermission
          );
        }
      }
      if (
        (newRecords.fuelLevel || newRecords?.Alearts?.fuelLevel) 
      ) {
        if (
          newRecords.fuelLevel - newRecords?.Alearts?.fuelLevel >=
          parseInt(newRecords.drainDifference)
        ) {
          sendPermission =
            newRecords?.result?.notificationPermission?.Fuel_Alert;

          const notificationPayload = {
            notification: {
              title: `Fuel Alert Increase`,
              body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
            },
            token: newRecords.result.firebaseToken,

          };
          await sendNotification(
            notificationPayload,
            newRecords.ownerID,
            records.deviceIMEI,
            _id,
            records.location,
            "Fuel",
            sendPermission
          );
        }
      }
      if (
        (records.ignition.status === false ||
          records.ignition.status === "false") &&
        (records.Motion === true || records.Motion === "true")
      ) {
        const notificationPayload = {
          notification: {
            title: `Security Alert: Your vehicle is in danger`,
            body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
          },
          token: newRecords.result.firebaseToken,
       
        };
        // Object.assign(notificationPayload.data,{sound:""})
        await sendNotification(
          notificationPayload,
          newRecords.ownerID,
          records.deviceIMEI,
          _id,
          records.location,
          "Security",
          sendPermission
        );
      }
      // Location Out of Area
      if (newRecords?.Area) {
        const centerLat = newRecords.location?.latitude;
        const centerLon = newRecords.location?.longitude;
        const radiusInFeet = newRecords.Area; // Radius in feet
        const currentLat = records.location.latitude;
        const currentLon = records.location.longitude;

        const distance = haversineDistance(
          currentLat,
          currentLon,
          centerLat,
          centerLon
        );
        // Check if the current location is out of the radius

        if (
          distance > radiusInFeet &&
          newRecords?.Alearts?.geoFenceOut === true
        ) {
          sendPermission =
            newRecords?.result?.notificationPermission?.Geofencing;

          await createSummary.create({
            imei: newRecords?.imei,
            Geofence_Out: true,
            location: records.location,
          });

          updatepayload.geoFenceOut = false;
          updatepayload.geoFenceIn = true;
          const notificationPayload = {
            notification: {
              title: `Out of Area!`,
              body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
            },
            token: newRecords.result.firebaseToken,
            android: {
              notification: {
                sound:
                  "https://trackroute.s3.ap-south-1.amazonaws.com/11173926811778657_Security Breach Alarm Siren.mp3",
              },
            },
            apns: {
              payload: {
                aps: {
                  sound:
                    "https://trackroute.s3.ap-south-1.amazonaws.com/11173926811778657_Security Breach Alarm Siren.mp3",
                },
              },
            },
          };
          await sendNotification(
            notificationPayload,
            newRecords.ownerID,
            records.deviceIMEI,
            _id,
            records.location,
            "Area",
            sendPermission
          );
        }
        if (
          distance <= radiusInFeet &&
          newRecords?.Alearts.geoFenceIn === true
        ) {
          sendPermission =
            newRecords?.result?.notificationPermission?.Geofencing;

          updatepayload.geoFenceOut = true;
          updatepayload.geoFenceIn = false;
          await createSummary.create({
            imei: newRecords?.imei,
            Geofence_In: true,
            location: records.location,
          });

          const notificationPayload = {
            notification: {
              title: `Entered Designated Area`,
              body: `Detected for ${newRecords?.driverName}, Vehicle No: ${newRecords?.vehicleNo}`,
            },
            token: newRecords.result.firebaseToken,

          };
          await sendNotification(
            notificationPayload,
            newRecords.ownerID,
            records.deviceIMEI,
            _id,
            records.location,
            "Area",
            sendPermission
          );
        }
      }
      updatepayload.fuelLevel = newRecords.fuelLevel;
      await cashingAlearts.updateOne(
        {
          imei: records.deviceIMEI,
        },
        {
          $set: updatepayload,
        }
      );
    } 
  } catch (err) {
    console.error("Error during aggregation:", err);
    return { status: "failed", message: "Error during aggregation" };
  }
};
// Helper function to send notification
const sendNotification = async (
  notificationPayload: any,
  ownerID: any,
  deviceID: string,
  _id: any,
  location: any,
  alertfor: string,
  sendPermission:any
) => {
  try {
   
   

    if(sendPermission && AllPermission){
      await Helper.sendPushNotification(
        notificationPayload
      );
    }
    // console.log(notificationPayload);
      await alearts.create({
        notificationalert: notificationPayload,
        imei: deviceID,
        status: "Success",
        alertfor,
        ownerID: ownerID,
        location,
        trackingID: _id,
      });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // console.log(lat1,lon1,lat2,lon2)
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInMiles = R * c; // Distance in miles

  return distanceInMiles * 5280; // Convert miles to feet
};

export const summary = async (req: Request, res: Response) => {
  try {
    const { today, yesterday, sevendays, deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ message: "Device ID is required" });
    }
    let matchfilter: any = {};
    const now = new Date();

    // Adjust the time for IST (UTC +5:30)
    const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

    // Convert current time to IST
    const nowInIST = new Date(now.getTime() + IST_OFFSET);
    console.log(nowInIST.toISOString(), "nowInIST"); // To view the current date in ISO format

    // Function to get date in YYYY-MM-DD format
    const formatDate = (date: any) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0"); // Get month with 2 digits
      const dd = String(date.getDate()).padStart(2, "0"); // Get day with 2 digits
      return `${yyyy}-${mm}-${dd}`; // Format as YYYY-MM-DD
    };

    // Get start of today in IST (only date, no time)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Set time to midnight
    const formattedStartOfToday = formatDate(startOfToday);

    // Get start of yesterday in IST (only date, no time)
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1); // Set the date to yesterday
    const formattedStartOfYesterday = formatDate(startOfYesterday);

    // Get start of 7 days ago in IST (only date, no time)
    const startOfSevenDays = new Date(startOfToday);
    startOfSevenDays.setDate(startOfToday.getDate() - 7); // Set the date to 7 days ago
    const formattedStartOfSevenDays = formatDate(startOfSevenDays);

    // For the end of the range (next day's date)
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(startOfToday.getDate() + 1); // Move to next day's date
    const formattedEndOfToday = formatDate(endOfToday);

    console.log("Formatted Start of Today:", formattedStartOfToday); // Example: "2025-02-12"
    console.log("Formatted Start of Yesterday:", formattedStartOfYesterday); // Example: "2025-02-11"
    console.log("Formatted Start of 7 Days Ago:", formattedStartOfSevenDays); // Example: "2025-02-05"
    console.log(
      "Formatted End of Today (next day's date):",
      formattedEndOfToday
    ); // Example: "2025-02-13"

    if (today)
      Object.assign(matchfilter, {
        createdAt: { $gte: new Date(formattedStartOfToday) },
      });
    if (yesterday) {
      Object.assign(matchfilter, {
        createdAt: {
          $gte: new Date(formattedStartOfYesterday), // Start of yesterday
          $lte: new Date(formattedStartOfToday), // End of yesterday (Start of today)
        },
      });
    }
    if (sevendays) {
      Object.assign(matchfilter, {
        createdAt: {
          $gte: new Date(formattedStartOfSevenDays), // Start of yesterday
          $lte: new Date(formattedStartOfToday), // End of yesterday (Start of today)
        },
      });
    }
    let data: any = []; // Initialize an array to store data for all devices

    for (let i = 0; i < deviceId.length; i++) {
      // Corrected loop condition
      const deviceData = await Device.findOne(
        { imei: deviceId[i] }, // Use deviceId[i] to target the current device
        { vehicleNo: 1, driverName: 1, mobileNo: 1, _id: 0 }
      ).lean();

      if (!deviceData) {
        return res
          .status(404)
          .json({ message: "Device not found for imei: " + deviceId[i] });
      }

      let summary: any = { ...deviceData }; // Initialize summary with device data

      // Fetch vehicle logs in parallel for the current device
      const [
        logs,
        maxSpeedRecord,
        avgSpeedData,
        ignitionOnCount,
        ignitionOffCount,
        stopLogs,
        idleLogs,
        firstIgitionOn,
        lastigitionOn,
        geofenceIn,
        geofenceout,
      ]: any = await Promise.all([
        VehicletrackingLogs.aggregate([
          // Match stage to filter documents
          {
            $match: {
              deviceIMEI: deviceId[i],
              "ignition.status": true,
              currentSpeed: { $gt: 0 },
            },
          },
          {
            $match: matchfilter,
          },
          // Project stage to return only the fields you need
          {
            $project: {
              location: 1,
              createdAt: 1,
            },
          },
          // Sort stage to sort by 'createdAt' in ascending order
          {
            $sort: { createdAt: 1 },
          },
        ]),
        VehicletrackingLogs.findOne(
          {
            deviceIMEI: deviceId[i],
            igitionOn: true,
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
          { currentSpeed: 1, createdAt: 1, location: 1 }
        )
          .sort({ currentSpeed: -1 })
          .lean(),
        VehicletrackingLogs.aggregate([
          { $match: { deviceIMEI: deviceId[i], ...matchfilter } },
          { $group: { _id: null, averageSpeed: { $avg: "$currentSpeed" } } },
        ]),
        createSummary.countDocuments({
          deviceIMEI: deviceId[i],
          igitionOn: true,
          ...matchfilter,
        }),
        createSummary.countDocuments({
          deviceIMEI: deviceId[i],
          igitionOF: false,
          ...matchfilter,
        }),
        VehicletrackingLogs.find(
          { deviceIMEI: deviceId[i], "ignition.status": false, ...matchfilter },
          { createdAt: 1 }
        )
          .sort({ createdAt: 1 })
          .lean(),
        VehicletrackingLogs.aggregate([
          {
            $match: {
              deviceIMEI: deviceId[i],
              "ignition.status": true,
              currentSpeed: { $lte: 0 },
            },
          },
          {
            $match: matchfilter,
          },
          {
            $project: {
              createdAt: 1,
            },
          },
        ]).sort({ createdAt: 1 }),

        createSummary.aggregate([
          {
            $match: {
              imei: deviceId[i],
              igitionOn: true,
            },
          },
          {
            $match: matchfilter,
          },
          { $sort: { createdAt: -1 } },
          {
            $limit: 1,
          },
        ]),
        createSummary.aggregate([
          {
            $match: {
              imei: deviceId[i],
              igitionOn: true,
            },
          },
          {
            $match: matchfilter,
          },
          { $sort: { createdAt: 1 } },
          {
            $limit: 1,
          },
        ]),
        createSummary.countDocuments({
          deviceIMEI: deviceId[i],
          Geofence_In: true,
          ...matchfilter,
        }),
        createSummary.countDocuments({
          deviceIMEI: deviceId[i],
          Geofence_Out: true,
          ...matchfilter,
        }),
      ]);
      if (logs.length > 0) {
        let totalDistance = logs.reduce(
          (distance: any, log: { location: any }, index: number) => {
            if (index < logs.length - 1) {
              return (
                distance +
                geolib.getDistance(log.location, logs[index + 1].location)
              );
            }
            return distance;
          },
          0
        );
        console.log(totalDistance, "distancedistance");
        // summary.latest_trip_km = (totalDistance / 1000).toFixed(2);
        summary.Distance_Kms = (totalDistance / 1000).toFixed(2);

        // let tripTimeMillis = logs[logs.length - 1].createdAt - logs[0].createdAt;
        // summary.latest_trip_time = formatTime(tripTimeMillis);
      }
      if (maxSpeedRecord) {
        // const istDateTime = new Date(maxSpeedRecord.createdAt).toLocaleString("en-IN", {
        //   timeZone: "Asia/Kolkata",
        //   hour12: true,
        //   year: "numeric",
        //   month: "2-digit",
        //   day: "2-digit",
        //   hour: "2-digit",
        //   minute: "2-digit",
        //   second: "2-digit",
        // });
        summary.Max_Speed = maxSpeedRecord.currentSpeed;
        summary.Max_Speed_Time = new Date(
          maxSpeedRecord.createdAt.toLocaleDateString()
        );
        // summary.max_speed_location = istDateTime;
      }

      summary.avg_speed = avgSpeedData.length
        ? avgSpeedData[0].averageSpeed.toFixed(2)
        : "0";

      summary.Ignition_On = ignitionOnCount;
      summary.Ignition_Off = ignitionOffCount;

      if (stopLogs.length > 1) {
        let stopTimeMillis =
          stopLogs[stopLogs.length - 1].createdAt - stopLogs[0].createdAt;
        summary.Stop_Time = formatTime(stopTimeMillis);
      }

      if (idleLogs.length > 1) {
        let idleTimeMillis =
          idleLogs[idleLogs.length - 1].createdAt - idleLogs[0].createdAt;
        summary.Idle_Time = formatTime(idleTimeMillis);
      }
      if (firstIgitionOn.length > 0) {
        summary.First_Ignition = firstIgitionOn[0]?.createdAt;
      }
      if (firstIgitionOn.length > 0) {
        summary.First_Ignition = firstIgitionOn[0]?.createdAt;
      }
      if (lastigitionOn.length > 0) {
        summary.Last_Ignition = lastigitionOn[0]?.createdAt;
      }

      summary.Geofence_In = geofenceIn;
      summary.Geofence_Out = geofenceout;

      // Add the summary to the data array
      data.push(summary);
    }

    let files = await UploadAndcreateExcelFile(data,"summary");
    // Once the loop is finished, you can return or process the data for all devices.
    return res.status(200).json({ data: files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

// Helper function to format time duration
const formatTime = (milliseconds: number) => {
  let hours = Math.floor(milliseconds / (1000 * 60 * 60));
  let minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}H ${minutes}M`;
};

const formatDate = (date: any) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Get month with 2 digits
  const dd = String(date.getDate()).padStart(2, "0"); // Get day with 2 digits
  return `${yyyy}-${mm}-${dd}`; // Format as YYYY-MM-DD
};

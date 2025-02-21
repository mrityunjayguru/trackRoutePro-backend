import { Request, Response } from "express";
import { deviceType } from "./_validation";
import _ from "lodash";

export const create = async (req: Request, res: Response) => {
  try {
    let data: any;
    // If it does not exist, create a new record
    data = await deviceType.create({ ...req.body });
    res.status(200).json({ data, message: "success" });
  } catch (err) {
    console.log(err, "errerrerr");
    res.status(500).json({ message: "Internal server error", error: err });
  }
};


export const get = async (req: Request, res: Response) => {
  const searchTerm = req.body.search || "";
  const status = req.body.status;

  try {
    const matchConditions: any = {};

    if (searchTerm) {
      matchConditions.$or = [
        { deviceType: { $regex: searchTerm, $options: "i" } },
        { status: { $regex: searchTerm, $options: "i" } },
      ];
    }
    if (status) {
      matchConditions.status = status;
    }

    const data = await deviceType.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "Imei",
          let: { deviceTypeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$deviceType", "$$deviceTypeId"],
                },
              },
            },
            {
              $lookup: {
                from: "UserDevices",
                localField: "imeiNo",
                foreignField: "imei",
                as: "userdevicescount",
              },
            },
            {
              $project: {
                imeiNo: 1,
                isAssigned: {
                  $cond: { if: { $gt: [{ $size: "$userdevicescount" }, 0] }, then: 1, else: 0 },
                },
              },
            },
          ],
          as: "imeis",
        },
      },
      {
        $addFields: {
          totalImeiCount: { $size: "$imeis" },
          assignCount: {
            $size: {
              $filter: {
                input: "$imeis",
                as: "imei",
                cond: { $eq: ["$$imei.isAssigned", 1] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          unassignCount: { $subtract: ["$totalImeiCount", "$assignCount"] },
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          _id: 1,
          deviceType: 1,
          status: 1,
          createdAt: 1,
          totalImeiCount: 1,
          assignCount: 1,
          unassignCount: 1,
        },
      },
    ]);

    res.status(200).json({ data, message: "success", status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data", error });
  }
};


export const getByid = async (req: Request, res: Response) => {
  let data: any;
  let payload = {};
  if (req.body._id) Object.assign(payload, { _id: req.body._id });
  data = await deviceType.findOne(payload);
  res.status(200).json({ data: data, message: "success" });
};

export const update = async (req: Request, res: Response) => {
  // Validate the incoming request data
  // Find the existing vehicle
  const vehicles: any = await deviceType.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }

  // Prepare the data to be updated
  const vehicleData = _.pick(req.body, ["deviceType", "status"]);

  Object.assign(vehicles, vehicleData); // Or vehicle.set(vehicleData)
  vehicles.updatedAt = new Date().toISOString(); // Optionally track when the vehicle was updated

  const updatedVehicle = await vehicles.save();

  res.status(200).json({ data: updatedVehicle, message: "success" });
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;
  const vehicles: any = await deviceType.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }
  if (vehicles.status == false) {
    return res.status(409).json({ message: "Not Authrized to delete Record." });
  }

  data = await deviceType.deleteOne({ _id: req.body._id });
  res.status(200).json({ data: data, message: "success" });
};

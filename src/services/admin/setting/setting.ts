import { Request, Response } from "express";
import {
  setting,
  settingAddValidection,
  settingUpdateVelidection,
} from "./_validation";
import _ from "lodash";

export const create = async (req: Request, res: Response) => {
  const { _id, status, image, hyperLink } = req.body; // Extract necessary fields
  const { error } = settingAddValidection(req.body); // Validate the request body

  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    let data:any;

    if (_id) {
      // Check if the record exists
      data = await setting.findById(_id);

      if (data) {
        // If it exists, update the record
        data.status = status; // Update fields as necessary
        data.image = image; 
        data.hyperLink = hyperLink; 
        await data.save(); // Save the updated record
        return res.status(200).json({ data, message: "success" });
      }
    }

    // If it does not exist, create a new record
    data = await setting.create(req.body);
    res.status(200).json({ data, message: "success" });

  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

export const get = async (req: Request, res: Response) => {
  let data: any;
  data = await setting.find({});
  res.status(200).json({ data: data, message: "success" ,status:200});
};

export const getByid = async (req: Request, res: Response) => {
  let data: any;
  let payload = {};
  if (req.body._id) Object.assign(payload, { _id: req.body._id });
  data = await setting.findOne(payload);
  res.status(200).json({ data: data, message: "success" });
};

export const update = async (req: Request, res: Response) => {
  // Validate the incoming request data
  const { error } = settingUpdateVelidection(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  // Find the existing vehicle
  const vehicles: any = await setting.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }

  // Prepare the data to be updated
  const vehicleData = _.pick(req.body, ["image", "status", "hyperLink"]);

  Object.assign(vehicles, vehicleData); // Or vehicle.set(vehicleData)
  vehicles.updatedAt = new Date().toISOString(); // Optionally track when the vehicle was updated

  const updatedVehicle = await vehicles.save();

  res.status(200).json({ data: updatedVehicle, message: "success" });
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;
  const vehicles: any = await setting.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }
  if (vehicles.status == false) {
    return res.status(409).json({ message: "Not Authrized to delete Record." });
  }

  data = await setting.deleteOne({ _id: req.body._id });
  res.status(200).json({ data: data, message: "success" });
};

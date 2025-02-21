import { Request, Response } from "express";
import { vehicleType, Vehicleupdate } from "./_validation";
import _ from "lodash";
let data: any;
export const create = async (req: Request, res: Response) => {



  data = await vehicleType.create({
    ...req.body,
    icons: req.body.file,
    createdAt: new Date().toISOString(),
  });
  // Send success response
  res.status(200).json({ data: data, message: "Success", status: 200 });
};

export const get = async (req: Request, res: Response) => {
  const payload={}
  if(req.body.status)
    Object.assign(payload,{status:req.body.status=="Active"?true:false})
  const data = await vehicleType.find(payload).sort({ createdAt: -1 });
  res.status(200).json({ data: data, message: "success",status:200 });
};

export const getByid = async (req: Request, res: Response) => {
  let data: any;
  let payload = {};
  if (req.body._id) Object.assign(payload, { _id: req.body._id });
  data = await vehicleType.findOne(payload);
  res.status(200).json({ data: data, message: "success",status:200 });
};

export const update = async (req: Request, res: Response) => {
  // Validate the incoming request data
  const { error } = Vehicleupdate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const payload: any = {};
    console.log(req.body, "Incoming request body");

    // Find the existing vehicle
    const vehicle = await vehicleType.findById(req.body._id);
    if (!vehicle) {
      return res.status(404).json({ message: "No record found." });
    }

    // Prepare the payload with the fields to update
    if (req.body.file) {
      // Assuming you are receiving a file path or a base64 string for file handling
      payload.icons = req.body.file;
    }

    payload.updatedAt = new Date();

    if (req.body.vehicleTypeName) {
      payload.vehicleTypeName = req.body.vehicleTypeName;
    }

    if (req.body.status === "true") {
      payload.status = true;
    } if (req.body.status === "false") {
      payload.status = false;
    }
    

    console.log(payload, "Payload for update");

    // Update the vehicle type
    await vehicleType.updateOne({ _id: req.body._id }, payload);

    // Fetch the updated vehicle
    const updatedVehicle = await vehicleType.findOne({ _id: req.body._id });

    return res.status(200).json({ data: updatedVehicle, message: "Success" });
  } catch (err) {
    console.error("Update failed:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const Delete = async (req: Request, res: Response) => {
  let data: any;
  const vehicles: any = await vehicleType.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }
  if (vehicles.status == false) {
    return res.status(409).json({ message: "Not Authrized to delete Record." });
  }

  data = await vehicleType.deleteOne({ _id: req.body._id });
  res.status(200).json({ data: data, message: "success" });
};

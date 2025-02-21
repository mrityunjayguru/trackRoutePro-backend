import { Request, Response } from "express";
import {
  splashAd,
  splashAdUpdateVelidection,
  spalshAdValidection,
} from "./_validation";
import _ from "lodash";
// import {io,users } from "../../../socket";
export const create = async (req: Request, res: Response) => {
  let data: any;

  const { error } = spalshAdValidection(req.body);
  if (error) throw error;
  data = await splashAd.create({ ...req.body });
  // Send success response
  res.status(200).json({ data: data, message: "success" });
};

export const get = async (req: Request, res: Response) => {
  let data: any;
// console.log(users,"usersusersusers")
// const user = users.find(user => user.userId === 'user123');
// if (user) {
//   io.to(user.socketId).emit('message', "hi vikash"); // Emit message to the user's socket
// }
  const searchTerm = req.body.search || "";
  data = await splashAd.aggregate([
    {
      $match: {
        $or: [
          { "hyperLink": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
          { "status": { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
        ],
      },
    },
  ]);
  res.status(200).json({ data: data, message: "success", status: 200 });
};

export const getByid = async (req: Request, res: Response) => {
  let data: any;
  let payload = {};
  if (req.body._id) Object.assign(payload, { _id: req.body._id });
  data = await splashAd.findOne(payload);
  res.status(200).json({ data: data, message: "success" });
};

export const update = async (req: Request, res: Response) => {
  // Validate the incoming request data
  const { error } = splashAdUpdateVelidection(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  // Find the existing vehicle
  const vehicles: any = await splashAd.findById(req.body._id);
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
  const vehicles: any = await splashAd.findById(req.body._id);
  if (!vehicles) {
    return res.status(404).json({ message: "No record found." });
  }
  if (vehicles.status == false) {
    return res.status(409).json({ message: "Not Authrized to delete Record." });
  }

  data = await splashAd.deleteOne({ _id: req.body._id });
  res.status(200).json({ data: data, message: "success" });
};

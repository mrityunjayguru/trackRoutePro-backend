import { Request, Response } from "express";
import { users } from "./_validation";
import { fileDelete, fileUpload } from "../../../helper/upload";
import _ from "lodash";

// const patientsView = async (patient: any) => {
//   patient = _.pick(patient, [
//     "firstName",
//     "middleName",
//     "lastName",
//     "birthDate",
//     "age",
//     "gender",
//     "wedding",
//     "referenceBy",
//     "language",
//     "religion",
//     "weight",
//     "height",
//     "maritialStatus",
//     "residence",
//     "office",
//     "other",
//     "address",
//     "area",
//     "state",
//     "city",
//     "pin",
//     "emailAddress",
//     "estimate",
//     "aadharNo",
//     "panNo",
//     "memberShipId",
//     "employeeId",
//     "occupation",
//     "spouseOccupation",
//     "companyName",
//     "education",
//     "mediclaim",
//     "mobileNumber",
//     "photo",
//     "mfile",
//     "remark",
//   ]);
//   return patient;
// };

export const allUser = async (req: Request, res: Response) => {
  let record: any;
  record= await users.aggregate([
    {
      $match:{
        role:"User"
      }
    },
    {
      $lookup: {
        from: 'vehicleDetails', // The name of the collection you want to join
        localField: '_id', // The field from the vehicles collection
        foreignField: 'ownerID', // The field from the vehicleDetails collection
        as: 'result' // The name of the output array field
      }
    }
  ]);
  if (!record) return res.status(400).json({ message: "No record found." });

  res.status(200).json({ data:record });
};

export const update = async (req: Request, res: Response) => {
  let patient: any = await users.findOne({ _id: req.body.pid });
  if (!patient) return res.status(404).json({ message: "No record found." });
  let isEmailExist: any = await users.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (isEmailExist)
    return res.status(400).json({ message: "Email address already in use." });

  patient = _.assign(
    patient,
    _.pick(req.body, [
      "firstName",
      "middleName",
      "lastName",
      "birthDate",
      "age",
      "gender",
      "wedding",
      "referenceBy",
      "language",
      "religion",
      "weight",
      "height",
      "maritialStatus",
      "estimate",
      "aadharNo",
      "panNo",
      "membershipId",
      "employeeId",
      "occupation",
      "spouseOccupation",
      "companyName",
      "education",
      "mediclaim",
      "photo",
      "remark",
    ])
  );
  patient.address.address = req.body.address;
  patient.address.area = req.body.area;
  patient.address.state = req.body.state;
  patient.address.city = req.body.city;
  patient.address.pin = req.body.pin;
  patient.communication.residence = req.body.residence;
  patient.communication.office = req.body.office;
  patient.communication.other = req.body.other;
  if (!Array.isArray(patient.mFile)) {
    patient.mFile = [];
  }
  if (req.body.uploadFile) {
    if (!patient.mFile.includes(req.body.uploadFile)) {
      patient.mFile.push(req.body.uploadFile);
    } else {
      return res.status(400).json({ message: "File Exists with same name" });
    }
  }

  if (req.body.deleteFile) {
    if (patient.mFile.includes(req.body.deleteFile)) {
      patient.mFile = patient.mFile.filter(
        (file: string) => file !== req.body.deleteFile
      );
    } else {
      return res.status(400).json({ message: "File Does Not Exists" });
    }
  }
  patient.updatedAt = new Date().toISOString();
  patient = await patient.save();
  patient = await new users(patient);

  res.status(200).json({ message: "Profile updated successfully." });
};

export const uploadFile = async (req: Request, res: Response) => {
  await fileUpload(req, res, async (err: any) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.body.filename)
      return res.status(400).json({ message: "Please select the file." });
    res.status(200).json({
      message: "File uploaded successfully.",
      data: {
        filename: req.body.filename,
      },
    });
  });
};

export const deleteFile = async (req: Request, res: Response) => {
  if (!req.body.filename || req.body.filename === "")
    return res.status(400).json({ message: "File is not selected." });

  const isDelete: any = await fileDelete(req.body.filename);
  if (!isDelete) {
    return res.status(404).json({ message: "No File Found" });
  }

  res.status(200).json({ message: "File deleted successfully." });
};

export const viewMfile = async (req: Request, res: Response) => {
  const { pid, fileType } = req.body;
  let patient: any = await users.findOne({ _id: pid }).select({ mFile: 1 });
  if (!patient) return res.status(400).json({ message: "No record found." });
  let filterFiles = patient.mFile;
  if (fileType) {
    const regex = new RegExp(`/${fileType}/`, "i");
    filterFiles = patient.mFile.filter((file: string) => regex.test(file));
  }
  res.status(200).json({ data: { patient: { mFile: filterFiles } } });
};
export const singleUser = async (req: Request, res: Response) => {
  const payload={
    phone: req.body.phone,
    role:"User",
    status:true
  }
  let redcords: any = await users.findOne(payload)
 
  res.status(200).json({ data: redcords});
};


import multer from "multer";
import * as fs from "fs";
import { NextFunction, Request, Response } from "express";
import config from "config";
import path from "path";

const fileSizeLimit: number = 5 * 1024 * 1024;
const acceptedImageExtensions: Array<string> = [
  "jpg",
  "jpeg",
  "png",
  "JPG",
  "JPEG",
  "PNG",
  "pdf",
  "PDF",
];

const upload = multer({
  limits: {
    fileSize: fileSizeLimit,
  },
  fileFilter: (req, file, cb) => {
    if (
      acceptedImageExtensions.some((ext) =>
        file.originalname.endsWith("." + ext)
      )
    ) {
      return cb(null, true);
    }
    return cb(
      new Error(
        "Only " + acceptedImageExtensions.join(", ") + " files are allowed!"
      )
    );
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let path: any = config.get("file.path");
      cb(null, path);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

export const fileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uploadFile: any = upload.single("file");
  

 
  let pid = req.body.pid;
  await uploadFile(req, res, async (error: any) => {
    if (req.body.pid) {
      pid = req.body.pid;
    }
    if (error) {
      return next(error);
    }
    if (!req.file) return res.status(400).json({ message: "No file found" });
    if (!req.body.fileType)
      return res.status(400).json({ message: "No file type selected" });
    let fileObject: any = {
      file: req.file,
      filename:
        pid + "/" + req.body.fileType + "/" + path.basename(req.file.path),
    };
    // console.log(req.file.path,"req.file.pathreq.file.pathreq.file.path")
    console.log(fileObject,"fileObjectfileObjectfileObject")
    const { uploadFile } = await import("./awsS3");
    let result = await uploadFile(fileObject);
    if (result == null)
      return res.status(400).json({ message: "File uploading failed." });
    if (result != null) {
      fs.unlinkSync(req.file.path);
      req.body.filename = result;
      next();
    }
  });
};

export const fileUploadHospital = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uploadFile: any = upload.single("file");
  let aid = req.body.aid;
  await uploadFile(req, res, async (error: any) => {
    // console.log(req.body);
    if (req.body.aid) {
      aid = req.body.aid;
    }
    if (error) {
      return next(error);
    }
    if (!req.file) return res.status(400).json({ message: "No file found" });
    if (!req.body.fileType)
      return res.status(400).json({ message: "No file type selected" });
    let fileObject: any = {
      file: req.file,
      filename:
        aid + "/" + req.body.fileType + "/" + path.basename(req.file.path),
    };
    const { uploadFile } = await import("./awsS3");
    let result = await uploadFile(fileObject);
    if (result == null)
      return res.status(400).json({ message: "File uploading failed." });
    if (result != null) {
      fs.unlinkSync(req.file.path);
      req.body.filename = result;
      next();
    }
  });
};

export const fileDelete = async (filename: string) => {
  const { deleteFile } = await import("./awsS3");
  return await deleteFile(filename);
};

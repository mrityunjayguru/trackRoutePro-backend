import { Router } from "express";
import { get, createwithExcel,create, update, Delete } from "./ImeI";
import middleware from "../../../middleware";
const router = Router();
router.post(
  "/createwithExcel",
  middleware.FileUpload([
    {
      name: "excel",
      maxCount: 1 
    },
  ]),
  middleware.UploadtoCloud, 
  createwithExcel
);
router.post(
  "/create",
  create
);
router.post("/get", get);
router.post(
  "/update",
  update
);
router.post("/delete", Delete);

export default router;


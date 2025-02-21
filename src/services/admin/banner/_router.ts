import { Router } from "express";
import { get, create, update, Delete } from "./banner";
import middleware from "../../../middleware";
const router = Router();
router.post(
  "/create",
  middleware.FileUpload("banner"),
  middleware.UploadtoCloud,
  create
);
router.post("/get", get);
router.post(
  "/update",
  middleware.FileUpload("banner"),
  middleware.UploadtoCloud,
  update
);
router.post("/delete", Delete);

export default router;


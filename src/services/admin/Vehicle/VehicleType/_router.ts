import { Router } from "express";
import { get, create, getByid, update, Delete } from "./vehicleType";
import middleware from "../../../../middleware";
const router = Router();

router.post(
  "/create",
  middleware.FileUpload("file"),
  middleware.UploadtoCloud,
  create
);
router.post("/get", get);
router.post("/getByid", getByid);
router.post(
  "/update",
  middleware.FileUpload("file"),
  middleware.UploadtoCloud,
  update
);
router.post("/Delete", Delete);
export default router;

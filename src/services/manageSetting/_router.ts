import { Router } from "express";
import { Addsetting, get, update } from "./manageSetting";
import middleware from "../../middleware";
const router = Router();

router.post(
  "/create",
  middleware.FileUpload([
    {
      name: "logo",
      maxCount: 1 // Maximum number of files for this field
    },
    {
      name: "applogo",
      maxCount: 1 // Maximum number of files for this field
    }
  ]),
  middleware.UploadtoCloud,
  Addsetting
);

router.post("/get", get);
router.post(
  "/update",
  middleware.FileUpload([
    {
      name: "logo",
      maxCount: 1 // Maximum number of files for this field
    },
    {
      name: "applogo",
      maxCount: 1 // Maximum number of files for this field
    }
  ]),
  middleware.UploadtoCloud,
  update
);

export default router;

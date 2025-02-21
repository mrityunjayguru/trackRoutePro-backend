import { Router } from "express";
import { get, create, update, Delete,notificationByID,sendPushNotification,alerts } from "./notification";

const router = Router();
router.post(
  "/send",
  create
);
router.post(
  "/notificationByID",
  notificationByID
);
router.post("/get", get);
router.post("/alerts", alerts);

router.post(
  "/update",
  update
);
router.post("/delete", Delete);
router.post("/sendPushNotification", sendPushNotification);


export default router;


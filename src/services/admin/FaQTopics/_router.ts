import { Router } from "express";
import { get, create, update, Delete } from "./FaQtopics";
const router = Router();
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


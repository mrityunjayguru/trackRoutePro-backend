import { Router } from "express";
import { update, uploadFile, view } from "./profile";
const router = Router();

router.post("/update", update);
router.post("/view", view);
router.post("/upload", uploadFile);

export default router;

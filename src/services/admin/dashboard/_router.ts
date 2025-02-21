import { Router } from "express";
import { getDashboard } from "./dashboard";
const router = Router();
router.post("/get", getDashboard);


export default router;


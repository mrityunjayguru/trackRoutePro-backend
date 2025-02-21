import { Router } from "express";
import { list } from "./schedule";

const router = Router();

router.post("/list", list);

export default router;

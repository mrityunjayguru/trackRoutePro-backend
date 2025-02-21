import { Router } from "express";
import { list } from "./currentToken";
const router = Router();

router.post("/token", list);

export default router;

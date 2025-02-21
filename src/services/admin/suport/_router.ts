import { Router } from "express";
import { create,get,update } from "./suport";
const router = Router();

router.post("/create", create);
router.post("/get", get);
router.post("/update", update);


// router.post("/groupSubescriber", groupSubescriber);



export default router;

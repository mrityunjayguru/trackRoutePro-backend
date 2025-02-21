import { Router } from "express";
import { downloadUser, downloadAmin, downloadDelear,downloadDevices,downloaddeviceTypes,downloadInventry} from "./Download";
const router = Router();
router.post("/downloadUser", downloadUser);
router.post("/downloadAmin", downloadAmin);
router.post("/downloadDelear", downloadDelear);
router.post("/downloadDevices", downloadDevices);
router.post("/downloaddeviceTypes", downloaddeviceTypes);
router.post("/downloadInventry", downloadInventry);



export default router;

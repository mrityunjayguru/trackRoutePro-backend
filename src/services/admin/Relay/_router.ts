import { Router } from "express";
import { engineResume,engineStop,checkStatus } from "./Relay";
const router = Router();
router.post('/engineResume', engineResume);

router.post('/engineStop',engineStop );

router.post('/checkStatus', checkStatus);




export default router;
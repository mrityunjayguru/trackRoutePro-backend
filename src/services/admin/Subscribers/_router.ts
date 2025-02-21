import { Router } from "express";
import { getSubscribers,groupSubescriber,getUserUserCode,getDelearSubscriber,getDelearRecord,getRecordAddedByDelear,getDealearSuport } from "./subscribers";
const router = Router();

router.post("/getSubscribers", getSubscribers);
router.post("/groupSubescriber", groupSubescriber);
router.post("/getUserUserCode", getUserUserCode);
router.post("/getDelearSubscriber", getDelearSubscriber);
router.post("/getDelearRecord", getDelearRecord);
router.post("/getRecordAddedByDelear", getRecordAddedByDelear);
router.post("/getDealearSuport", getDealearSuport);

export default router;

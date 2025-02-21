import { Router } from "express";
import { get, create,getByVehicleID,update,Delete,searchuser,Alerts,searchDevices,rootHistory,summary } from "./vehicleTracking";
import middleware from "../../../../middleware";
// import middleware from "../middleware";

const router = Router();

router.post('/create', create);
router.post('/get',middleware.isAuth,get);
router.post('/getByVehicleID',middleware.isAuth,getByVehicleID );
router.post('/update', update);
router.post('/Delete', Delete);
router.post('/rootHistory',middleware.isAuth, rootHistory);

router.post('/searchuser', searchuser);
router.post('/searchDevices', searchDevices);

router.post('/Alerts',middleware.isAuth, Alerts);
router.post('/summary',middleware.isAuth, summary);





export default router;
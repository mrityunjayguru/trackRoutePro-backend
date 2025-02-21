import { Router } from "express";
import { get, create,getByid,update,Delete } from "./deviceType";
const router = Router();

router.post('/create',
    create
);
router.post('/get', get);
router.post('/getByid',getByid );
router.post('/update',
    update
);
router.post('/Delete', Delete);


export default router;
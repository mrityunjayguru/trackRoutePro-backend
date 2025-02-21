import { Router } from "express";
import { get, create,getByid,update,Delete } from "./setting";
import middleware from "../../../middleware";
const router = Router();

router.post('/create',
    middleware.FileUpload("image"),
    middleware.UploadtoCloud,
    create
);
router.post('/get', get);

router.post('/getByid',getByid );
router.post('/update',
    middleware.FileUpload("image"),
    middleware.UploadtoCloud,
    update
);
router.post('/Delete', Delete);


export default router;
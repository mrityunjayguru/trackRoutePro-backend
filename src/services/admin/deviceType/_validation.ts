import { model } from "mongoose";
import { deviceTypeSchema } from "../../../models/deviceType";
import Joi from 'joi';

export const deviceType = model('deviceType', deviceTypeSchema);


export const addDeviceTypeValidection = (data: any) => {
    const schema = Joi.object({
        deviceType: Joi.string().required().label('deviceType'),
        status: Joi.string().optional().label('status'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const settingUpdateVelidection = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


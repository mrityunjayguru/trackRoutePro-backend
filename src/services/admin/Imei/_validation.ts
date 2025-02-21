import { model } from "mongoose";
import { ImeiSchema } from "../../../models/Imei";
import Joi from 'joi';
import { deviceTypeSchema } from "../../../models/deviceType";

export const deviceType = model('deviceType', deviceTypeSchema);
export const Imei= model('Imei', ImeiSchema);


export const validationFaQList = (data: any) => {
    const schema = Joi.object({
        title: Joi.string().required().label('title'),
        topicId: Joi.string().required().label('topic'),
        priority: Joi.string().required().label('priority'),
        status: Joi.string().required().label('status'),
        description: Joi.string().required().label('description'),

    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const validationUpdateFaQList = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};



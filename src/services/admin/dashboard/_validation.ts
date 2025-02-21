import { model } from "mongoose";
import { usersSchema } from "../../../models/users";
import { AleartsSchema } from "../../../models/Alearts";

import { vehicleDetailsSchema } from "../../../models/Vehicle";
// import { notificationSchema } from "../../../models/notification";



import Joi from 'joi';

import { deviceTypeSchema } from "../../../models/deviceType";

export const deviceType = model('deviceType', deviceTypeSchema);

export const user= model('user', usersSchema);
export const device= model('device', vehicleDetailsSchema);
// export const notification= model('notification', notificationSchema);
export const Alearts= model('alearts', AleartsSchema);





export const validationFaQList = (data: any) => {
    const schema = Joi.object({
        title: Joi.string().required().label('title'),
        topic: Joi.string().required().label('topic'),
        priority: Joi.string().required().label('priority'),
        status: Joi.boolean().required().label('status'),

    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const validationUpdateFaQList = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};



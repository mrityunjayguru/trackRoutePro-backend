import { model } from "mongoose";
import { notificationSchema } from "../../../models/notification";
import { usersSchema } from "../../../models/users";
import { AleartsSchema } from "../../../models/Alearts";


import Joi from 'joi';

export const notification = model('notification', notificationSchema);
export const User = model("Users", usersSchema);
export const Alearts = model("alearts", AleartsSchema);




export const validationnotification = (data: any) => {
    const schema = Joi.object({
        description: Joi.string().required().label('description'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const validationUpdatenotification = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};



import { model } from "mongoose";
import Joi from 'joi';
import { adminSchema } from "../../../models/admin";
export const Admin = model('Admin', adminSchema);
export const validateUpdate = (data: any) => {
    const schema = Joi.object({
        userName: Joi.string().required().label('User Name'),
        emailAddress: Joi.string().required().email().label('Email Address')
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


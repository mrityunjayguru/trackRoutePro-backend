import { model } from "mongoose";
import { adminSchema } from "../../../models/admin";
import {usersSchema} from "../../../models/users"
import Joi from 'joi';

export const Admin = model('Admin', adminSchema);
export const user = model('user', usersSchema);



export const validateSignup = (data: any) => {
    const schema = Joi.object({
        userName: Joi.string().required().label('Name'),
        emailAddress: Joi.string().required().label('Email'),
        password: Joi.string().required().label('Password'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
}


export const validateLogin = (data: any) => {
    const schema = Joi.object({
        userName: Joi.string().required().label('User Name'),
        password: Joi.string().required().label('Password'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateEmail = (data: any) => {
    const schema = Joi.object({
        emailAddress: Joi.string().email().required().label('Email Address'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
export const validateResetPassword = (data: any) => {
    const schema = Joi.object({
        verificationCode: Joi.string().required().label('Verification Code'),
        password: Joi.string().required().label('Password'),
        emailAddress: Joi.string().email().required().label('Email Address'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
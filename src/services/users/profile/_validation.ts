import { model } from "mongoose";
import Joi from 'joi';
import { usersSchema } from "../../../models/users";

export const users = model('users', usersSchema);

export const validateUpdate = (data: any) => {
    const schema = Joi.object({
        firstName: Joi.string().required().label('First Name'),
        middleName: Joi.string().required().label('Middle Name'),
        lastName: Joi.string().required().label('Last Name'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
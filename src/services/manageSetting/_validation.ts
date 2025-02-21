import Joi from 'joi';
import ManageSettings from "../../models/manageSetting"
export const ManageSetting=ManageSettings
export const validateUpdate = (data: any) => {
    const schema = Joi.object({
        userName: Joi.string().required().label('User Name'),
        emailAddress: Joi.string().required().email().label('Email Address')
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


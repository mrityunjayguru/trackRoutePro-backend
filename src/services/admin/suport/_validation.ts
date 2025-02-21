import { model } from "mongoose";
import Joi from 'joi';
import { supportSchema } from "../../../models/suport";
import { usersSchema } from "../../../models/users";

export const suport = model('support', supportSchema);
export const users = model('users', usersSchema);

export const validateUpdate = (data: any) => {
    const schema = Joi.object({
        deviceID: Joi.string().required().label('deviceID'),
        userId: Joi.string().required().email().label('userId'),
        suport: Joi.string().required().label('suport'),
        description: Joi.string().required().email().label('description')
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


import { model } from "mongoose";
import { settingSchema } from "../../../models/setting";
import Joi from 'joi';

export const setting = model('setting', settingSchema);


export const settingAddValidection = (data: any) => {
    const schema = Joi.object({
        image: Joi.string().required().label('image'),
        hyperLink: Joi.string().optional().label('hyperLink'),
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


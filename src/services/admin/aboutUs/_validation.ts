import { model } from "mongoose";
import { aboutSchema } from "../../../models/about";
import Joi from 'joi';

export const about = model('about', aboutSchema);


export const validationabout = (data: any) => {
    const schema = Joi.object({
        description: Joi.string().required().label('description'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const validationUpdateabout = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};



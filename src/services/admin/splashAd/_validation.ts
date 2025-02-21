import { model } from "mongoose";
import { splashAdSchema } from "../../../models/splashAd";
import Joi from 'joi';

export const splashAd = model('splashAd', splashAdSchema);


export const spalshAdValidection = (data: any) => {
    const schema = Joi.object({
        image: Joi.string().required().label('image'),
        hyperLink: Joi.string().optional().label('hyperLink'),
        status: Joi.string().optional().label('status'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const splashAdUpdateVelidection = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


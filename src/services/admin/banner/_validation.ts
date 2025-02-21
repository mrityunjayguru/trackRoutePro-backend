import { model } from "mongoose";
import { bannerSchema } from "../../../models/banner";
import Joi from 'joi';

export const banner = model('banner', bannerSchema);


export const validationBanner = (data: any) => {
    const schema = Joi.object({
        banner: Joi.string().required().label('Vehicle Registration No'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const validationUpdateBanner = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};



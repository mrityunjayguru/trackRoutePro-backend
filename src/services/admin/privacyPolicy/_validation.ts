import { model } from "mongoose";
import { privacyPolicySchema } from "../../../models/privacyPolicy";
import Joi from 'joi';

export const privacyPolicy = model('privacyPolicy', privacyPolicySchema);


export const validationprivacyPolicy = (data: any) => {
    const schema = Joi.object({
        description: Joi.string().required().label('description'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const validationUpdateprivacyPolicy = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};



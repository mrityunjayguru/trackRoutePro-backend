import { model } from "mongoose";
import { FaQTopicsSchema } from "../../../models/FAQTopics";
import Joi from 'joi';

export const FaQTopics = model('FaQTopics', FaQTopicsSchema);


export const validationFaQTopics = (data: any) => {
    const schema = Joi.object({
        title: Joi.string().required().label('title'),
        priority: Joi.string().required().label('priority'),
        status: Joi.string().required().label('status'),

    }).unknown(false);

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const validationUpdateFaQTopics = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};



import { model } from "mongoose";
import { FaQListSchema } from "../../../models/FaQList";
import Joi from 'joi';

export const FaQList= model('FaQList', FaQListSchema);


export const validationFaQList = (data: any) => {
    const schema = Joi.object({
        title: Joi.string().required().label('title'),
        topicId: Joi.string().required().label('topic'),
        priority: Joi.string().required().label('priority'),
        status: Joi.string().required().label('status'),
        description: Joi.string().required().label('description'),

    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const validationUpdateFaQList = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};



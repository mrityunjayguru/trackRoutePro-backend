import { model } from "mongoose";
import { relaySchema } from "../../../models/relay";
import Joi from 'joi';
import { vehicleDetailsSchema } from "../../../models/Vehicle";

export const relay = model('relay', relaySchema);
export const vehicle = model('vehicle', vehicleDetailsSchema);


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


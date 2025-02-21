import { model } from "mongoose";
import { vehicleDetailsSchema } from "../../../../models/Vehicle";
import { renewRequestSchema } from "../../../../models/ReniewRequest";
import {cashingAleartsSchema} from "../../../../models/cashingAlearts"

import Joi from 'joi';

export const Vehicle = model('Vehicle', vehicleDetailsSchema);
export const renewRequest = model('renewRequest', renewRequestSchema);
export const cashingAlearts = model('cashingAlearts', cashingAleartsSchema);


export const validateVehicleDetails = (data: any) => {
    const schema = Joi.object({
        vehicleRegistrationNo: Joi.string().required().label('Vehicle Registration No'),
        dateAdded: Joi.date().optional().label('Date Added'),
        vehicleNo: Joi.string().optional().label('vehicleNo'),
        deviceID: Joi.string().optional().label('deviceID'),
        IMEINo: Joi.string().optional().label('IMEINo'),
        stringAdded: Joi.string().optional().label('Date Added'),
        driverName: Joi.string().required().label('Driver Name'),
        mobileNo: Joi.string().pattern(/^[0-9]{10}$/).required().label('Driver Mobile No'),
        vehicleType: Joi.string().required().label('Vehicle Type'),
        vehicleBrand: Joi.string().required().label('Vehicle Brand'),
        vehicleModel: Joi.string().required().label('Vehicle Model'),
        insuranceExpiryDate: Joi.date().required().label('Insurance Expiry Date'),
        pollutionExpiryDate: Joi.date().required().label('Pollution Expiry Date'),
        fitnessExpiryDate: Joi.date().required().label('Fitness Expiry Date'),
        fule: Joi.string().required().label('Fitness Expiry Date'),
        nationalPermitExpiryDate: Joi.date().required().label('National Permit Expiry Date')
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};


export const Vehicleupdate = (data: any) => {
    const schema = Joi.object({
        _id: Joi.string().required()
      
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateEmail = (data: any) => {
    const schema = Joi.object({
        emailAddress: Joi.string().email().required().label('Email Address'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
export const validateResetPassword = (data: any) => {
    const schema = Joi.object({
        verificationCode: Joi.string().required().label('Verification Code'),
        password: Joi.string().required().label('Password'),
        emailAddress: Joi.string().email().required().label('Email Address'),
    });

    return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
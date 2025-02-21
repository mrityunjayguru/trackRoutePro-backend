import { model } from "mongoose"
import { vehicleTrackingSchema } from "../../../../models/tracking";
import { VehicletrackingLogsSchema } from "../../../../models/VehicletrackingLogs";
import { summarySchema } from "../../../../models/summary";



import { vehicleDetailsSchema } from "../../../../models/Vehicle";
import { usersSchema } from "../../../../models/users";
import { AleartsSchema } from "../../../../models/Alearts";

import { cashingAleartsSchema } from "../../../../models/cashingAlearts";

import Joi from 'joi';

export const tracking = model('tracking', vehicleTrackingSchema);
export const createSummary = model('summary', summarySchema);

export const VehicletrackingLogs = model('VehicletrackingLogs', VehicletrackingLogsSchema);


export const Device = model('Device', vehicleDetailsSchema);
export const users = model('users', usersSchema);
export const alearts = model('alearts', AleartsSchema);

export const cashingAlearts = model('cashingAlearts', cashingAleartsSchema);

export const validateVehicleDetails = (data: any) => {
    const schema = Joi.object({
        vehicleRegistrationNo: Joi.string().required().label('Vehicle Registration No'),
        dateAdded: Joi.date().optional().label('Date Added'),
        name: Joi.string().required().label('Driver Name'),
        mobileNo: Joi.string().pattern(/^[0-9]{10}$/).required().label('Driver Mobile No'),
        vehicleType: Joi.string().required().label('Vehicle Type'),
        vehicleBrand: Joi.string().required().label('Vehicle Brand'),
        vehicleModel: Joi.string().required().label('Vehicle Model'),
        insuranceExpiryDate: Joi.date().required().label('Insurance Expiry Date'),
        pollutionExpiryDate: Joi.date().required().label('Pollution Expiry Date'),
        fitnessExpiryDate: Joi.date().required().label('Fitness Expiry Date'),
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
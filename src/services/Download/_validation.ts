import { model } from "mongoose";
import { usersSchema } from "../../models/users";
import Joi from "joi";
import { vehicleDetailsSchema } from "../../models/Vehicle";

import { cashingAleartsSchema } from "../../models/cashingAlearts";
import { deviceTypeSchema } from "../../models/deviceType";


// import { ImeiSchema } from "../../../models/Imei";
import { ImeiSchema } from "../../models/Imei";

export const Vehicle = model("Vehicle", vehicleDetailsSchema);
export const User = model("Users", usersSchema);
export const cashingAlearts = model("cashingAlearts", cashingAleartsSchema);
export const imeiDb = model("imei", ImeiSchema);
export const deviceType = model("deviceType", deviceTypeSchema);


export const validateSignup = (data: any) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    emailAddress: Joi.string().required().email().label("Email Address"),
    password: Joi.string().required().label("Password"),
    mobileNumber: Joi.string(),
    gender: Joi.string(),
    birthDate: Joi.string(),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateLogin = (data: any) => {
  const schema = Joi.object({
    emailAddress: Joi.string().required().email().label("Email Address"),
    password: Joi.string().required().label("Password"),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateLoginWithMobile = (data: any) => {
  const schema = Joi.object({
    mobileNumber: Joi.string().required().label("Mobile Number"),
    verificationCode: Joi.string().required().label("Verification Code"),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateVerify = (data: any) => {
  const schema = Joi.object({
    emailAddress: Joi.string().required().email().label("Email Address"),
    otp: Joi.string().required().label("Verification Code"),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateNobile = (data: any) => {
  const schema = Joi.object({
    mobileNumber: Joi.string().required().label("Mobile Number"),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateEmail = (data: any) => {
  const schema = Joi.object({
    emailAddress: Joi.string().email().required().label("Email Address"),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateResetPassword = (data: any) => {
  const schema = Joi.object({
    verificationCode: Joi.string().required().label("Verification Code"),
    password: Joi.string().required().label("Password"),
  });

  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

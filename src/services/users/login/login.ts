import { Request, Response } from "express";
import {
  User,
  validateEmail,
  validateLogin,
  validateLoginWithMobile,
  validateSignup,
  validateVerify,
  Vehicle,
  cashingAlearts,
  imeiDb
} from "./_validation";
import { decrypt, encrypt } from "../../../helper/encription";
import _ from "lodash";
import helper from "../../../helper";
const mongoose = require("mongoose");
import {createUserTemplate} from "../../../MailBody/userWelcomeTemplet"
import {forgotPasswordTemplate} from "../../../MailBody/OptMailBody"

export const signup = async (req: Request, res: Response) => {
  const { error } = validateSignup(req.body);
  if (error) throw error;
  let Existuser: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (Existuser)
    return res
      .status(400)
      .json({ emailAddress: "Email Address is already exist." });

  let payload: any = _.pick(req.body, [
    "firstName",
    "lastName",
    "emailAddress",
    "mobileNumber",
    "gender",
  ]);
  payload.password = await encrypt(req.body.password);

  let newUser: any = new User(payload);
  newUser.createdAt = new Date().toISOString();
  newUser.updatedAt = new Date().toISOString();

  let existingUser: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (existingUser) {
    existingUser.verificationCode = newUser.verificationCode;
    existingUser.updatedAt = new Date().toISOString();
    existingUser = await existingUser.save();
  } else {
    newUser = await newUser.save();
  }
  const token: any = await newUser.getAccessToken();

  res
    .status(200)
    .setHeader("x-auth-token", token)
    .status(200)
    .json({ data: existingUser, token: token, message: "Signup Successfully" });
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { error } = validateVerify(req.body);
    if (error)
      return res.status(400).json({ message: error.message, status: 400 });

    let user: any = await User.findOne({
      _id: req.body._id,
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification Code not matched or invalid.",
        status: 400,
      });
    }
    if (user.otp != req.body.otp) {
      return res.status(400).json({
        message: "OTP is incorrect.",
        status: 400,
      });
    }
    const currentTime = new Date().getTime();
    const otpGenerationTime = new Date(user.updatedAt).getTime();
    const timeDifference = currentTime - otpGenerationTime;

    if (timeDifference > 600000) {
      return res.status(410).json({
        message: "OTP has expired. Please request a new OTP.",
        status: 410,
      });
    }
    res
      .status(200)
      .json({ message: "User verified successfully.", status: 200 });
  } catch (err) {
    console.error("Error verifying user:", err);
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

export const loginWithEmail = async (req: Request, res: Response) => {
  const { error } = validateLogin(req.body);
  if (error) throw error;

  let Users: any = await User.findOne({
    emailAddress: req.body.emailAddress,
    role:"User"
  });
  // console.log(Users,"UsersUsersUsers")
  if (!Users)
    return res.status(403).json({
      message: "Invalid emailAddress or password! Please try again.",
      status: 403,
    });
  if (Users.status === "pending")
    return res
      .status(400)
      .json({ message: "Email Address not verified.", status: 400 });
  if (Users.status === false)
    return res.status(400).json({
      message: "Your account has been blocked! Please contact admin.",
      status: 400,
    });
  let password: string = await decrypt(Users.password);
  if (req.body.password != password)
    return res.status(400).json({
      message: "Invalid email or password! Please try again.",
      status: 400,
    });

  // const token: any = await Users.getAccessToken();
  const token: any = await Users.getAccessToken();
  await User.updateOne({ _id: Users._id }, { $set: { token: token } });
  const userDetails: any = {
    Name: Users.Name,
    emailAddress: Users.emailAddress,
    _id: Users._id,
    passworf:Users.password,
    len:password.length,
    phone: Users.phone,
    role: Users.role,
    permissions: Users.permissions,
    status: Users.status,
    sessionVersion:Users.sessionVersion,
    profile: Users.profile,
    subscribeType: Users.subscribeType ? Users.subscribeType : "",
    createdAt: new Date(Users.createdAt).toLocaleDateString(),
    updatedAt: new Date(Users.updatedAt).toLocaleDateString(),
  };
  res
    .status(200)
    .setHeader("x-auth-token", token)
    .json({ data: userDetails, token: token, message: "success", status: 200 });
};

export const loginWithMobile = async (req: Request, res: Response) => {
  const { error } = validateLoginWithMobile(req.body);
  if (error) throw error;

  let Users: any = await User.findOne({
    mobileNumber: req.body.mobileNumber,
  });
  if (!Users)
    return res.status(400).json({
      message: "Invalid mobile number or otp! Please try again.",
      status: 400,
    });

  if (req.body.verificationCode != Users.verificationCode)
    return res.status(400).json({
      message: "Invalid mobile number or otp! Please try again.",
      status: 400,
    });

    const token: any = await Users.getAccessToken();  // Fetch token
    await User.updateOne(
      { _id: Users._id },  // Ensure this is the correct user ID
      { $set: { token: token } }  // Use $set to update the token field
    );
  res
    .status(200)
    .setHeader("x-auth-token", token)
    .json({ token: token, message: "success", status: 200 });
};
export const forgotPassword = async (req: Request, res: Response) => {
  // Validate email input
  // const { error } = validateEmail(req.body);
  // if (error) {
  //   return res.status(400).json({ message: "Invalid email format.", status: 400 });
  // }

  // Find the user by email address
  let user:any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email address! Please try again.",
      status: 400,
    });
  }

  // Encrypt the new password
  const oldpassword: string = await decrypt(user.password);

  if (oldpassword != req.body.password) {
    return res.status(400).json({
      message: "password not match.",
      status: 401,
    });
  }
  // Update user with the new password and set a verification code
  user.password = await encrypt(req.body.newpassword);

  // Save updated user data
  try {
    await user.save();
    return res.status(200).json({
      message: "Password reset successful. Please use your new password.",
      status: 200,
    });
  } catch (error) {
    console.error("Error saving updated user:", error);
    return res.status(500).json({
      message: "Internal server error while updating password.",
      status: 500,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  // const { error } = validateResetPassword(req.body);
  // if (error) throw error;

  let Users: any = await User.findOne({
    _id: req.body._id,
  });
  // console.log(Users,"UsersUsers")
  if (!Users)
    return res
      .status(400)
      .json({ message: "EmailAddress not found..", status: 400 });
  if (Users.otp != req.body.otp) {
    return res.status(400).json({
      message: "OTP is incorrect.",
      status: 400,
    });
  }
  const currentTime = new Date().getTime();
  const otpGenerationTime = new Date(Users.updatedAt).getTime();
  const timeDifference = currentTime - otpGenerationTime;
  if (timeDifference > 600000) {
    return res.status(410).json({
      message: "OTP has expired. Please request a new OTP.",
      status: 410,
    });
  }
  let password: string = await encrypt(req.body.password);
  Users.password = password;
  // Users = await Users.save();
  await User.updateOne({_id:req.body._id},{password:password},{set:true})
  res.status(200).json({ message: "Success", status: 200 });
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { error } = validateEmail(req.body);
    if (error)
      return res.status(400).json({ message: error.message, status: 400 });
    let user: any = await User.findOne({ emailAddress: req.body.emailAddress });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email Address! Please try again.",
        status: 400,
      });
    }

    const generateOtp = await helper.generateOTP();
    const payload = {
      otp: generateOtp,
      updatedAt: new Date().toISOString(),
    };
    await User.updateOne(
      { _id: req.body._id },
      { $set: payload }
    );
    const emailpayload: any = {
      to: req.body.emailAddress,
      subject: "One Time Pasword for Reset Password",
      text: `Hello ${user.Name}`,  // Personalized text
      body: forgotPasswordTemplate(user,generateOtp),
    };
 
   await helper.sendEmail(emailpayload)
    res.status(200).json({ otp: generateOtp, message: "success", status: 200 });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Server error", status: 500 });
  }
};

export const sendOtpMobile = async (req: Request, res: Response) => {
  // const { error } = validateMobile(req.body);
  // if (error) throw error;

  let Users: any = await User.findOne({
    mobileNumber: req.body.mobileNumber,
  });
  if (!Users)
    return res.status(400).json({
      message: "Invalid Mobile Number! Please try again.",
      status: 400,
    });

  Users.verificationCode = 523322;
  Users.updatedAt = new Date().toISOString();
  Users = await Users.save();
  res.status(200).json({ message: "OTP sent successfully.", status: 200 });
};


export const createUser = async (req: Request, res: Response) => {
  const { 
    emailAddress, 
    delearid, 
    deviceId, 
    imei, 
    vehicleNo, 
    password, 
    profile, 
    deviceStatus, 
    displayParameters, 
    vehicleType, 
    subscribeType, 
    uid,
    operator,
    dealerCode,
    deviceSimNumber,
    isAppCreated,
  } = req.body;

  try {
    let display:any;
    if(subscribeType !== "Dealer"){
       display = Object.fromEntries(
        displayParameters.map((key: any) => [key, true])
      );
    }
  

    if (subscribeType !== "Dealer") {
      const existingDevice:any = await Vehicle.findOne({ imei:imei});
      if (existingDevice) {
        if (existingDevice.imei === imei) return res.status(400).json({ message: "IMEI Already Exists." });
      }
      const existingImei = await imeiDb.findOne({ imeiNo: imei });
      if (!existingImei) {
        return res.status(400).json({ message: "IMEI does not exist." });
      }
    }

  

    // Encrypt password
    const encryptedPassword = await encrypt(password);

    // Create the user
    const newUser:any = await User.create({
      ...req.body,
      profileId: profile,
      createdBy: { id: uid },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      password: encryptedPassword,
    });

    let device:any;
    if (subscribeType !== "Dealer") {
      device = await Vehicle.create({
        deviceId,
        delearid,
        dealerCode,
        imei,
        vehicleNo,
        vehicleType,
        operator,
        deviceSimNumber,
        ownerID: newUser._id,
        displayParameters:display,
        status: deviceStatus,
        createdBy: { id: uid },
        isAppCreated,
        createdAt: new Date().toISOString(),
      });

      await cashingAlearts.create({
        ...req.body,
        ownerID: newUser._id,
        deviceDetail: device._id,
      });
    }

    // Send email
    const emailPayload = {
      to: emailAddress,
      subject: "Welcome to",
      body: createUserTemplate(req.body),
    };

    await helper.sendEmail(emailPayload);

    res.status(200).json({ message: "Success", user: newUser });
  } catch (error:any) {
    if (error.code === 11000) {  
      const duplicateField = Object.keys(error.keyValue)[0];  
       res.status(409).json({
        status: "error",
        message: `Duplicate entry detected for ${duplicateField}`,
        duplicateField: error.keyValue[duplicateField],
      });
  }
   else{
    res.status(500).json({ message: "Internal server error" });
   }
  }
};



export const updateUser = async (req: Request, res: Response) => {
  let data: any;
  try {
    const mongoose = require("mongoose");
    let updatedBy = {
      id: req.body.uid,
      time: new Date()
    };
    const payload: any = {
      $push: { updatedBy },  // Use the shorthand for pushing the object into the array
      updatedAt: new Date(),  // Ensure updatedAt is updated
    };
    const notificationPermission:any = {};

    const userId = new mongoose.Types.ObjectId(req.body._id);
    if (!userId) {
      return res.status(400).json({ message: "Please Fill Necessary Details" });
    }

    // Check uniqueness of phone, email, and idno if they are being updated
   

   if(req.body.emailAddress){
    payload.emailAddress = req.body.emailAddress;
   }

if(req.body.idno){
  payload.idno = req.body.idno;

}

    // Assign other fields to the payload if they exist in the request body
    Object.assign(payload, { updatedAt: new Date() });
    if (req.body.Name) payload.Name = req.body.Name;
    if (req.body.phone) payload.phone = req.body.phone;

    if (req.body.uniqueID) payload.uniqueID = req.body.uniqueID;
    if (req.body.password) payload.password = await encrypt(req.body.password);
    if (req.body.dob) payload.dob = req.body.dob;
    if (req.body.gender) payload.gender = req.body.gender;
    if (req.body.address) payload.address = req.body.address;
    if (req.body.country) payload.country = req.body.country;
    if (req.body.state) payload.state = req.body.state;
    if (req.body.city) payload.city = req.body.city;
    if (req.body.pinCode) payload.pinCode = req.body.pinCode;
    if (req.body.companyId) payload.companyId = req.body.companyId;
    if (req.body.profile) payload.profile = req.body.profile;
    if (req.body.profileId) payload.profileId = req.body.profileId;
    if (req.body.idDocument) payload.idDocument = req.body.idDocument;
    if (req.body.contactPerson) payload.contactPerson = req.body.contactPerson;
    if (req.body.PersonDesignation) payload.PersonDesignation = req.body.PersonDesignation;
if(req.body.status==true || req.body.status=='true'){
  payload.isView = false;
}
if(req.body.status==true || req.body.status=='true'){
  payload.isView = false;
}
    if (req.body.role) payload.role = req.body.role;
    if (req.body.notification === true || req.body.notification === false)
      payload.notification = req.body.notification;
    if (req.body.firebaseToken) payload.firebaseToken = req.body.firebaseToken;
    if (req.body.permissions) payload.permissions = req.body.permissions;
    if (req.body.subscripeType) payload.subscripeType = req.body.subscripeType;
    if (req.body.status) {
      payload.status = req.body.status;
    }
    if (req.body.Document) {
      payload.Document = req.body.Document;
    }
      if (req.body.all==true || req.body.all==false) notificationPermission.all = req.body.all;
      if (req.body.Ignition==true || req.body.Ignition==false) notificationPermission.Ignition = req.body.Ignition;
      if (req.body.Geofencing==true || req.body.Geofencing==false) notificationPermission.Geofencing = req.body.Geofencing;
      if (req.body.Over_Speed==true ||req.body.Over_Speed==false  ) notificationPermission.Over_Speed = req.body.Over_Speed;
      if (req.body.Parking_Alert==true || req.body.Parking_Alert==false) notificationPermission.Parking_Alert = req.body.Parking_Alert;
      if (req.body.AC_Door_Alert==true || req.body.AC_Door_Alert==false) notificationPermission.AC_Door_Alert = req.body.AC_Door_Alert;
      if (req.body.Fuel_Alert==true ||req.body.Fuel_Alert==false) notificationPermission.Fuel_Alert = req.body.Fuel_Alert;
      if (req.body.Expiry_Reminders==true || req.body.Expiry_Reminders==false) notificationPermission.Expiry_Reminders = req.body.Expiry_Reminders;
      if (req.body.Vibration==true || req.body.Vibration==false) notificationPermission.Vibration = req.body.Vibration;
      if (req.body.Device_Power_Cut==true || req.body.Device_Power_Cut==false) notificationPermission.Device_Power_Cut = req.body.Device_Power_Cut;
      if (req.body.Device_Low_Battery==true || req.body.Device_Low_Battery==false) notificationPermission.Device_Low_Battery = req.body.Device_Low_Battery;

      if (req.body.Other_Alerts==true || req.body.Other_Alerts==false) notificationPermission.Other_Alerts = req.body.Other_Alerts;

      if(Object.keys(notificationPermission).length>0){
        Object.assign(payload,{notificationPermission:notificationPermission})
      }

    // Update the user record
    data = await User.findOneAndUpdate(
      { _id: userId },
      payload,
      { new: true } // Return the updated document
    );
    const oldpassword: any = await decrypt(data.password);
      let newdata:any={
        data,
        len:oldpassword.length
      }
    res.status(200).json({ data: newdata, message: "success" });
  } catch (error:any) {
    if (error.code === 11000) {  
      const duplicateField = Object.keys(error.keyValue)[0];  
       res.status(409).json({
        status: "error",
        message: `Duplicate entry detected for ${duplicateField}`,
        duplicateField: error.keyValue[duplicateField],
      });
  }else{
    res.status(500).json({ message: "Server error", error });
  }
  }
};




export const UpdateToken = async (req: Request, res: Response) => {
  try {
    const { firebaseToken, isLogout, _id } = req.body;

    if (!_id || !firebaseToken) {
      return res.status(400).json({ message: "Please provide necessary details." });
    }

    const userId = new mongoose.Types.ObjectId(_id);
    let checkExistToken = await User.findOne({
      _id: userId,
      firebaseToken: { $in: [firebaseToken] } // Corrected syntax
    });

   
  

    // Prepare the update operation
    let updateOperation: any = {};

    if (isLogout === true) {
      updateOperation = {
        $pull: { firebaseToken: firebaseToken } // Remove the provided token
      };
    } else {
      if(!checkExistToken){
        updateOperation = {
          $push: { firebaseToken: firebaseToken } // Add only if it doesn't exist
        };
      }
    }

    const data = await User.updateOne({ _id: userId }, updateOperation);
    res.status(200).json({ data, message: "Token updated successfully." });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};





export const UserDetails = async (req: Request, res: Response) => {
  let data: any;
  try {
    const userId = new mongoose.Types.ObjectId(req.body._id);
    const project = {
      notificationPermission: 1
      // Add more fields as required or adjust as needed
    };

     data = await User.findOne({ _id: userId }, project);
        // data=await User.findOne({_id:userId})
    res.status(200).json({ data: data, message: "success" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};



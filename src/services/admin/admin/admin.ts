import { Request, Response } from "express";
import {
  User,
  validateEmail,
  validateLogin,
  validateLoginWithMobile,
  validateSignup,
  validateVerify,
} from "./_validation";
import { decrypt, encrypt } from "../../../helper/encription";
import _ from "lodash";
import helper from "../../../helper";
// Adjust the import based on your project structure
import {AdminWelcomeTemplate} from "../../../MailBody/AdminWelcomeTemplete"
export const AllAdmin = async (req: Request, res: Response) => {
  const searchTerm = req.body.search || ""; // Get the search term from the request body
  const limit = req.body.limit || 10; // Get limit from request body or default to 10
  const offset = req.body.offset || 0; // Get offset from request body or default to 0
const filter=req.body.filter
const payload:any = { role: "Admin" };
if (filter === "Active") {
  payload.status = true;
} else if (filter === "InActive") {
  payload.status = false;
}
  try {
    // First, get the total count of matching records
    if (searchTerm) {
      payload.$or = [
        { Name: { $regex: searchTerm, $options: "i" } },
        { emailAddress: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ];
    }
    const totalCount = await User.countDocuments(payload);
    // Now, perform the aggregation to get the actual data
    const data = await User.aggregate([
      {
        $match: {
          role: "Admin",
          $or: [
            { Name: { $regex: searchTerm, $options: "i" } },
            { emailAddress: { $regex: searchTerm, $options: "i" } },
            { phone: { $regex: searchTerm, $options: "i" } },
          ],
        },
      },
      {
        $match:payload
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $project: {
          Name: 1,
          emailAddress: 1,
          phone: 1,
          permissions: 1,
          profile: 1,
          role: 1,
          status: 1,
          createdAt: 1,
          password:1,
        },
      },
      
      {
        $skip: offset, // Skip the number of documents specified by offset
      },
      {
        $limit: limit, // Limit the number of documents returned
      }, 
     
    ]);

    // Send response with data and total count
    res.status(200).json({ data, totalCount, message: "success", status: 200 });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


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
    .json({ data: existingUser, token: token, message: "Signup Successfully" });
};

export const verify = async (req: Request, res: Response) => {
  const { error } = validateVerify(req.body);
  if (error) throw error;

  let Users: any = await User.findOne({
    emailAddress: req.body.emailAddress,
    verificationCode: req.body.verificationCode,
  });
  if (!Users)
    return res
      .status(400)
      .json({ message: "Verification Code not matched.", status: 400 });

  Users.verificationCode = "";
  Users.status = "success";

  Users.updatedAt = new Date().toISOString();
  Users = await Users.save();

  res.status(200).json({ message: "User verified successfully.", status: 200 });
};

export const loginWithEmail = async (req: Request, res: Response) => {
  const { error } = validateLogin(req.body);
  if (error) throw error;

  let Users: any = await User.findOne({
    emailAddress: req.body.emailAddress,
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
  if (Users.status === "block")
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
  res
    .status(200)
    .setHeader("x-auth-token", token)
    .json({ data: Users, token: token, message: "success", status: 200 });
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

  const token: any = await Users.getAccessToken();
  // console.log(Users, "UsersUsersUsers");
  await User.updateOne({ _id: Users._id }, { $set: { token: token } });
  res
    .status(200)
    .setHeader("x-auth-token", token)
    .json({ token: token, message: "success", status: 200 });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { error } = validateEmail(req.body);
  if (error) throw error;

  let Users: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (!Users)
    return res.status(400).json({
      message: "Invalid emailAddress! Please try again.",
      status: 400,
    });

  Users.verificationCode = 523322;

  Users.updatedAt = new Date().toISOString();
  Users = await Users.save();

  res.status(200).json({
    message: "Reset Password Link sent on registered email address.",
    status: 200,
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  // const { error } = validateResetPassword(req.body);
  // if (error) throw error;

  let Users: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (!Users)
    return res
      .status(400)
      .json({ message: "EmailAddress not found..", status: 400 });

  let password: string = await decrypt(Users.password);
  console.log(password,"passwordpasswordpassword")
  if (req.body.password != password)
    return res.status(400).json({ message: "wrong password", status: 400 });

  Users.password = await encrypt(req.body.newpassword);
  Users.updatedAt = new Date().toISOString();
  Users = await Users.save();
  res.status(200).json({ message: "Success", status: 200 });
};

export const sendOtp = async (req: Request, res: Response) => {
  const { error } = validateEmail(req.body);
  if (error) throw error;

  let Users: any = await User.findOne({
    emailAddress: req.body.emailAddress,
  });
  if (!Users)
    return res.status(400).json({
      message: "Invalid Email Address! Please try again.",
      status: 400,
    });

  Users.verificationCode = 523322;
  Users.updatedAt = new Date().toISOString();
  Users = await Users.save();

  res.status(200).json({ message: "OTP sent successfully.", status: 200 });
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


export const createAdmin = async (req: Request, res: Response) => {
  try {
    // Validate the input (you can expand this as needed)

    const { emailAddress, password, username, profile } = req.body;
    // Encrypt password
    const newPassword = await encrypt(password);

    // Create the new user document
    const newUser = await User.create({
      ...req.body,
      profileId: profile, // Assuming profile is coming in the request body
      Name: username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      password: newPassword,
    });

    // Optional: Send welcome email (uncomment and update as necessary)
    const emailPayload = {
      to: emailAddress,
      subject: `Welcome to ${username}`,
      body:AdminWelcomeTemplate(req.body),
    };
    await helper.sendEmail(emailPayload);

    // Return the newly created user
    res.status(200).json({ message: "Admin created successfully", user: newUser });

  } catch (error:any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: " phone already exists." });
    }
   else{
    res.status(500).json({ message: "Internal server error" });
   }
  }
};


export const updateUser = async (req: Request, res: Response) => {
  let data: any;
  const defaultPermissions = {
    Subscribers: { Add: false, Update: false, View: false },
    Map: { Add: false, Update: false, View: false },
    Notification: { Add: false, Update: false, View: false },
    Support: { Add: false, Update: false, View: false },
    Device: { Add: false, Update: false, View: false },
    Admin: { Add: false, Update: false, View: false },
    Settings: { Add: false, Update: false, View: false },
    FAQTopics: { Add: false, Update: false, View: false },
    FAQ: { Add: false, Update: false, View: false },
    Vehicle: { Add: false, Update: false, View: false },
    Splash: { Add: false, Update: false, View: false },
  };
  try {
    const mongoose = require("mongoose");
    const payload: any = {};
    const userId = new mongoose.Types.ObjectId(req.body._id);

    if (!userId) {
      return res.status(400).json({ message: "Please Fill Necessary Details" });
    }
     payload.updatedAt=new Date()
    //  console.log(req.body.status,"lllllllllllll")
    // Update other fields
    if (req.body.Name) payload.Name = req.body.Name;
    if (req.body.uniqueID) payload.uniqueID = req.body.uniqueID;
    if (req.body.emailAddress) payload.emailAddress = req.body.emailAddress;
    if (req.body.phone) payload.phone = req.body.phone;
    if (req.body.password) payload.password = await encrypt(req.body.password); // Encrypt the new password
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
    if (req.body.otp) payload.otp = req.body.otp;
    if (req.body.role) payload.role = req.body.role;
    if (req.body.subscripeType) payload.subscripeType = req.body.subscripeType;
    if (req.body.status !== undefined) {
      payload.status = req.body.status;
    }
    if (req.body.password) payload.password = await encrypt(req.body.password); // Encrypt the new password

    // Update permissions
    if (req.body.permissions) {
      const updatedPermissions:any = { ...defaultPermissions };
    
      Object.keys(req.body.permissions).forEach((key) => {
        if (updatedPermissions[key]) {
          updatedPermissions[key] = {
            ...updatedPermissions[key],
            ...req.body.permissions[key],
          };
        }
      });
    
      payload.permissions = updatedPermissions;
    } else {
      payload.permissions = defaultPermissions;
    }
    const updatedUser = await User.updateOne(
      { _id: userId },
      {
        $set: {
          ...payload,
          token: null,
        },
      }
    );
    if (updatedUser) {
      data = await User.findOne({ _id: req.body._id });
    }

    res.status(200).json({ data: data, message: "success" });
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

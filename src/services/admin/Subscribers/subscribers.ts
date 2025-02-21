import { Request, Response } from "express";
import { subscriber, vehicle,deviceType } from "./_validation"; // Adjust the import path according to your project structure
import mongoose from "mongoose";

export const getSubscribers = async (req: Request, res: Response) => {
  try {
    let loginuser = req.body;
    const searchTerm = req.body.search || ""; // Default to empty string if no search term provided
    const limit = req.body.limit || 10; // Get limit from request or default to 10
    const offset = req.body.offset || 0; // Get offset from request or default to 0
    const filters = req.body.filter || "";
    const filterpayload = {};
    if (loginuser.loginUserRole == "Dealer") {
      let delearuserRecord: any = await vehicle.find({
        dealerCode: new mongoose.Types.ObjectId(loginuser.uid),
      });

      // Extract ownerID from each record
      let ownerIds = delearuserRecord?.map(
        (record: { ownerID: any }) => record.ownerID
      );

      // Correcting the Object.assign syntax
      Object.assign(filterpayload, { _id: { $in: ownerIds } });

      console.log(ownerIds, "Extracted owner IDs");
    }

    if (req.body.filter)
      Object.assign(filterpayload, { subscribeType: filters });

    if (req.body.isAppCreated)
      Object.assign(filterpayload, { isAppCreated: req.body.isAppCreated });

    if (req.body.status == true || req.body.status == false)
      Object.assign(filterpayload, { status: req.body.status });
    // if (req.body.createdDelearId) {
    //   Object.assign(filterpayload, {
    //     createdDelearId: new mongoose.Types.ObjectId(req.body.createdDelearId),
    //   });
    // }
    const totalCount = await subscriber.countDocuments({
      role: req.body.role, // Ensure the role is "User"
      subscribeType: { $in: ["Individual", "Company", "Dealer"] }, // Filter subscribeType as Individual or Company
      $or: [
        { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
        { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
        { phone: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on phone
        { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
      ],
      ...filterpayload, // Spread the additional filter payload here
    });

    // Now, perform the aggregation to get the actual data
    const data = await subscriber.aggregate([
      {
        $match: {
          role: req.body.role,
          subscribeType: { $in: ["Individual", "Company", "Dealer"] },
          $or: [
            { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
            { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
            { phone: { $regex: searchTerm, $options: "i" } },
            { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
          ],
        },
      },
      {
        $match: filterpayload,
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$ownerID", "$$subscriberId"] }],
                },
              },
            },
            {
              $lookup: {
                from: "vehicleType",
                localField: "vehicleType",
                foreignField: "_id",
                as: "vehicleTypeDetails",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "dealerCode",
                foreignField: "_id",
                as: "dealerdetail",
              },
            },
            {
              $lookup: {
                from: "Imei",
                localField: "imei",
                foreignField: "imeiNo",
                as: "deviceTypeDetail",
              },
            },
            {
              $unwind: {
                path: "$deviceTypeDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$dealerdetail",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $unwind: {
                path: "$vehicleTypeDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $lookup: {
          from: "UserDevices", // The collection to join
          let: { subscriberId: "$_id" }, // Use the subscriber's ID
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$delearid", "$$subscriberId"] }, // Match by subscriberId
                  ],
                },
              },
            },
          ],
          as: "createdelearrecord", // Alias the resulting records as "createdelearrecord"
        },
      },
      {
        $addFields: {
          activeCount: {
            $size: {
              $filter: {
                input: "$createdelearrecord",
                as: "record",
                cond: { $eq: ["$$record.status", "Active"] }, // Filter for "active" status
              },
            },
          },
          inactiveCount: {
            $size: {
              $filter: {
                input: "$createdelearrecord",
                as: "record",
                cond: { $eq: ["$$record.status", "InActive"] }, // Filter for "inactive" status
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdDelearId",
          foreignField: "_id",
          as: "createdDealerRecord",
        },
      },
     
      {
        $lookup: {
          from: "users", // Target collection
          let: { createdById: "$createdBy.id" }, // Pass the `createdBy.id` as a variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$createdById" }] // Convert `createdBy.id` to ObjectId and match
                }
              }
            }
          ],
          as: "createdByUser"
        }
      },
    
      {
        $unwind: {
          path: "$createdDealerRecord",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$updatedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users", // Join the user collection
          localField: "updatedBy.id", // The field from updatedBy to match
          foreignField: "_id", // The field in the user collection to match
          as: "userDetails", // Store matched user details in the userDetails array
        },
      },
      {
        $addFields: {
          DelearDeviceCount: { $size: "$createdelearrecord" },
        },
      },
      {
        $addFields: {
          userDevicesCount: { $size: "$userDevices" },
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$createdByUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $addFields: {
      //     "userDetails.time": "$updatedBy.time", // Add the update time from updatedBy to userDetails
      //   },
      // },
     

      {
        $group: {
          _id: "$_id",
          userDetails: { $push: {
            Name: "$userDetails.Name", 
            emailAddress: "$userDetails.emailAddress", 
            createdAt: "$userDetails.createdAt", 
            time: "$updatedBy.time", 
            uniqueCode: "$userDetails.uniqueCode" 
          } },
          createdByUser: { $push: "$createdByUser" },
          deviceTypeDetail: { $push: "$deviceTypeDetail" },
          Name: { $first: "$Name" },
          contactPerson: { $first: "$contactPerson" },
          PersonDesignation: { $first: "$PersonDesignation" },
          uniqueCode: { $first: "$uniqueCode" },
          activeCount: { $first: "$activeCount" },
          inactiveCount: { $first: "$inactiveCount" },
          userDevicesCount: { $first: "$userDevicesCount" },
          userDevices: { $first: "$userDevices" },
          DelearDeviceCount: { $first: "$DelearDeviceCount" },
          emailAddress: { $first: "$emailAddress" },
          phone: { $first: "$phone" },
          dob: { $first: "$dob" },
          gender: { $first: "$gender" },
          address: { $first: "$address" },
          country: { $first: "$country" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pinCode: { $first: "$pinCode" },
          companyId: { $first: "$companyId" },
          password: { $first: "$password" },
          profile: { $first: "$profile" },
          profileId: { $first: "$profileId" },
          role: { $first: "$role" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          // firebaseToken: { $first: "$firebaseToken" },
          createdDealerRecord: { $first: "$createdDealerRecord" },
          idno: { $first: "$idno" },
          createdDelearId: { $first: "$createdDelearId" },
          notification: { $first: "$notification" },
          subscribeType: { $first: "$subscribeType" },
          permissions: { $first: "$permissions" },
          otp: { $first: "$otp" }, // Keep the first otp in the group
          idDocument: { $first: "$idDocument" }, // Keep the first idDocument in the group
          Document: { $first: "$Document" }, // Keep the first Document in the group
          updatedBy: { $push: "$updatedBy" },
        },
      },
      
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $skip: offset, // Skip the number of documents specified by offset
      },
      {
        $limit: limit, // Limit the number of documents returned
      },
    ]);

    // Send response with data and total count
    res.status(200).json({ data, totalCount, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const groupSubescriber = async (req: Request, res: Response) => {
  const necessary = {
    // {
    // $project: {
    id: 1,
    _id: 1,
    Name: 1,
    uniqueID: 1,
    emailAddress: 1,
    phone: 1,
    dob: 1,
    gender: 1,
    address: 1,
    country: 1,
    state: 1,
    city: 1,
    pinCode: 1,
    companyId: 1,
    profile: 1,
    profileId: 1,
    role: 1,
    subscribeType: 1,
    status: 1,
    createdAt: 1,
    updatedAt: 1,
    userDevices: 1,
    password: 1,
    PersonDesignation:1,
    contactPerson:1,
    Document:1,
    idno:1,
    idDocument:1,
    deviceTypeDetail:1,
    createdByUser:1
    // },
    // },
  };

  try {
    const Individual = await subscriber.aggregate([
      {
        $match: {
          role: "User",
          subscribeType: "Individual",
        },
      },
      // {
      //   $match: {
      //     createdAt: {
      //         $gte: { $dateSubtract: { startDate: new Date(), unit: "day", amount: 30 } }
      //     }
      // }
      // },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$ownerID", "$$subscriberId"] }, // Match UserDevices' subscriberId with subscriber's _id
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "vehicleType",
                localField: "vehicleType",
                foreignField: "_id",
                as: "vehicleTypeDetails",
              },
            },
            {
              $lookup: {
                from: "Imei",
                localField: "imei",
                foreignField: "imeiNo",
                as: "deviceTypeDetail",
              },
            },
            {
              $unwind: {
                path: "$vehicleTypeDetails",
              },
            },
            {
              $unwind: {
                path: "$deviceTypeDetail",
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $lookup: {
          from: "users", // Target collection
          let: { createdById: "$createdBy.id" }, // Pass the `createdBy.id` as a variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$createdById" }] // Convert `createdBy.id` to ObjectId and match
                }
              }
            }
          ],
          as: "createdByUser"
        }
        
      },
   
      {
        $project: necessary,
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $limit: 10,
      },
    ]);
    const Company = await subscriber.aggregate([
      {
        $match: {
          role: "User",
          subscribeType: "Company",
        },
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$ownerID", "$$subscriberId"] }],
                },
              },
            },
            {
              $lookup: {
                from: "vehicleType",
                localField: "vehicleType",
                foreignField: "_id",
                as: "vehicleTypeDetails",
              },
            },
            {
              $lookup: {
                from: "Imei",
                localField: "imei",
                foreignField: "imeiNo",
                as: "deviceTypeDetail",
              },
            },
            {
              $unwind: {
                path: "$deviceTypeDetail",
              },
            },
            {
              $unwind: {
                path: "$vehicleTypeDetails",
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $lookup: {
          from: "users", // Target collection
          let: { createdById: "$createdBy.id" }, // Pass the `createdBy.id` as a variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$createdById" }] // Convert `createdBy.id` to ObjectId and match
                }
              }
            }
          ],
          as: "createdByUser"
        }
        
      },
      {
        $project: necessary,
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({ data: { Individual, Company }, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserUserCode = async (req: Request, res: Response) => {
  try {
    let data = await subscriber.aggregate([
      {
        $match: {
          role: { $in: ["Admin", "SuperAdmin", "Dealer"] },
        },
      },
      {
        $project: {
          _id: 1,
          uniqueCode: 1,
        },
      },
    ]);
    res.status(200).json({ data: data, message: "success" });
  } catch (err: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDelearSubscriber = async (req: Request, res: Response) => {
  try {
    let loginuser = req.body;
    const searchTerm = req.body.search || ""; // Default to empty string if no search term provided
    const limit = req.body.limit || 10; // Get limit from request or default to 10
    const offset = req.body.offset || 0; // Get offset from request or default to 0
    const filters = req.body.filter || "";
    const filterpayload = {};
    // const matchdealear: any = {};

    if (loginuser.loginUserRole == "Dealer") {
      let delearuserRecord: any = await vehicle.find({
        dealerCode: new mongoose.Types.ObjectId(loginuser.uid),
      });
    
      // Extract ownerID from each record
      let ownerIds: any = delearuserRecord?.map(
        (record: { ownerID: any }) => record.ownerID
      );
    
      if (ownerIds.length > 0) {
        Object.assign(filterpayload, {
          $or: [
            { _id: { $in: ownerIds } },
            req.body.createdDelearId
              ? { createdDelearId: new mongoose.Types.ObjectId(loginuser.uid) }
              : {},
          ],
        });
      } else if (req.body.createdDelearId) {
        Object.assign(filterpayload, {
          createdDelearId: new mongoose.Types.ObjectId(loginuser.uid),
        });
      }
    }
    if (req.body.filter)
      Object.assign(filterpayload, { subscribeType: filters });

    if (req.body.isAppCreated)
      Object.assign(filterpayload, { isAppCreated: req.body.isAppCreated });

    if (req.body.status == true || req.body.status == false)
      Object.assign(filterpayload, { status: req.body.status });

    const totalCount = await subscriber.countDocuments({
      role: req.body.role, // Ensure the role is "User"
      subscribeType: { $in: ["Individual", "Company", "Dealer"] }, // Filter subscribeType as Individual or Company
      $or: [
        { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
        { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
        { phone: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on phone
        { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
      ],
      ...filterpayload
    });

    const data = await subscriber.aggregate([
      {
        $match: {
          role: req.body.role,
          subscribeType: { $in: ["Individual", "Company", "Dealer"] },
          $or: [
            { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
            { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
            { phone: { $regex: searchTerm, $options: "i" } },
            { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
          ],
        },
      },
      {
        $match: filterpayload,
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$ownerID", { $toObjectId: "$$subscriberId" }] },
                    { $eq: ["$dealerCode", { $toObjectId: loginuser.uid }] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "vehicleType",
                localField: "vehicleType",
                foreignField: "_id",
                as: "vehicleTypeDetails",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "dealerCode",
                foreignField: "_id",
                as: "dealerdetail",
              },
            },
            {
              $lookup: {
                from: "Imei",
                localField: "imei",
                foreignField: "imeiNo",
                as: "deviceTypeDetail",
              },
            },
            {
              $unwind: {
                path: "$deviceTypeDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$dealerdetail",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $unwind: {
                path: "$vehicleTypeDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $lookup: {
          from: "UserDevices", // The collection to join
          let: { subscriberId: "$_id" }, // Use the subscriber's ID
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$delearid", "$$subscriberId"] }, // Match by subscriberId
                  ],
                },
              },
            },
          ],
          as: "createdelearrecord", // Alias the resulting records as "createdelearrecord"
        },
      },
      {
        $addFields: {
          activeCount: {
            $size: {
              $filter: {
                input: "$createdelearrecord",
                as: "record",
                cond: { $eq: ["$$record.status", "Active"] }, // Filter for "active" status
              },
            },
          },
          inactiveCount: {
            $size: {
              $filter: {
                input: "$createdelearrecord",
                as: "record",
                cond: { $eq: ["$$record.status", "InActive"] }, // Filter for "inactive" status
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdDelearId",
          foreignField: "_id",
          as: "createdDealerRecord",
        },
      },
      {
        $lookup: {
          from: "users", // Target collection
          let: { createdById: "$createdBy.id" }, // Pass the `createdBy.id` as a variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$createdById" }] // Convert `createdBy.id` to ObjectId and match
                }
              }
            }
          ],
          as: "createdByUser"
        }
      },
      {
        $unwind: {
          path: "$createdByUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$createdDealerRecord",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$updatedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users", 
          localField: "updatedBy.id", 
          foreignField: "_id", 
          as: "userDetails", 
        },
      },
      {
        $addFields: {
          DelearDeviceCount: { $size: "$createdelearrecord" },
        },
      },
      {
        $addFields: {
          userDevicesCount: { $size: "$userDevices" },
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "userDetails.time": "$updatedBy.time", 
        },
      },
      {
        $group: {
          _id: "$_id",
          userDetails: { $push: {
            Name: "$userDetails.Name", 
            emailAddress: "$userDetails.emailAddress", 
            createdAt: "$userDetails.createdAt", 
            time: "$userDetails.updatedAt", 
            uniqueCode: "$userDetails.uniqueCode" 
          } },
          createdByUser: { $push: "$createdByUser" },
          deviceTypeDetail: { $push: "$deviceTypeDetail" },
          PersonDesignation: { $push: "$PersonDesignation" },
          contactPerson: { $push: "$contactPerson" },
          Name: { $first: "$Name" },
          uniqueCode: { $first: "$uniqueCode" },
          activeCount: { $first: "$activeCount" },
          inactiveCount: { $first: "$inactiveCount" },
          userDevicesCount: { $first: "$userDevicesCount" },
          userDevices: { $first: "$userDevices" },
          DelearDeviceCount: { $first: "$DelearDeviceCount" },
          emailAddress: { $first: "$emailAddress" },
          phone: { $first: "$phone" },
          dob: { $first: "$dob" },
          gender: { $first: "$gender" },
          address: { $first: "$address" },
          country: { $first: "$country" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pinCode: { $first: "$pinCode" },
          companyId: { $first: "$companyId" },
          password: { $first: "$password" },
          profile: { $first: "$profile" },
          isView: { $first: "$isView" },
          profileId: { $first: "$profileId" },
          role: { $first: "$role" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          firebaseToken: { $first: "$firebaseToken" },
          createdDealerRecord: { $first: "$createdDealerRecord" },
          idno: { $first: "$idno" },
          createdDelearId: { $first: "$createdDelearId" },
          notification: { $first: "$notification" },
          subscribeType: { $first: "$subscribeType" },
          permissions: { $first: "$permissions" },
          otp: { $first: "$otp" }, // Keep the first otp in the group
          idDocument: { $first: "$idDocument" }, // Keep the first idDocument in the group
          Document: { $first: "$Document" }, // Keep the first Document in the group
          updatedBy: { $push: "$updatedBy" }, // Push updatedBy array into the result
        },
      },

      {
        $sort: { updatedAt: -1 }, 
      },
      {
        $skip: offset, 
      },
      {
        $limit: limit, 
      },
    ]);

    // Send response with data and total count
    res.status(200).json({ data, totalCount, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDelearRecord = async (req: Request, res: Response) => {
  try {
    let loginuser = req.body;
    const searchTerm = req.body.search || ""; // Default to empty string if no search term provided
    const limit = req.body.limit || 10; // Get limit from request or default to 10
    const offset = req.body.offset || 0; // Get offset from request or default to 0
    const filters = req.body.filter || "";
    const filterpayload = {};
    if(req.body.createdDelearId) {
      Object.assign(filterpayload, {
        createdDelearId: new mongoose.Types.ObjectId(loginuser.uid),
      });
    }
    if (req.body.filter)
      Object.assign(filterpayload, { subscribeType: filters });

    if (req.body.isAppCreated)
      Object.assign(filterpayload, { isAppCreated: req.body.isAppCreated });

    if (req.body.status == true || req.body.status == false)
      Object.assign(filterpayload, { status: req.body.status });

    const totalCount = await subscriber.countDocuments({
      role: req.body.role, // Ensure the role is "User"
      subscribeType: { $in: ["Individual", "Company", "Dealer"] }, // Filter subscribeType as Individual or Company
      $or: [
        { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
        { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
        { phone: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on phone
        { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
      ],
      ...filterpayload
    });

    const data = await subscriber.aggregate([
      {
        $match: {
          role: req.body.role,
          subscribeType: { $in: ["Individual", "Company", "Dealer"] },
          $or: [
            { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
            { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
            { phone: { $regex: searchTerm, $options: "i" } },
            { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
          ],
        },
      },
      {
        $match: filterpayload,
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$dealerCode", { $toObjectId: "$$subscriberId" }] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "vehicleType",
                localField: "vehicleType",
                foreignField: "_id",
                as: "vehicleTypeDetails",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "dealerCode",
                foreignField: "_id",
                as: "dealerdetail",
              },
            },
            {
              $lookup: {
                from: "Imei",
                localField: "imei",
                foreignField: "imeiNo",
                as: "deviceTypeDetail",
              },
            },
            {
              $unwind: {
                path: "$deviceTypeDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$dealerdetail",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $unwind: {
                path: "$vehicleTypeDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "userDevices",
        },
      },
 
      {
        $addFields: {
          activeCount: {
            $size: {
              $filter: {
                input: "$userDevices",
                as: "record",
                cond: { $eq: ["$$record.status", "Active"] }, // Filter for "active" status
              },
            },
          },
          inactiveCount: {
            $size: {
              $filter: {
                input: "$userDevices",
                as: "record",
                cond: { $eq: ["$$record.status", "Inactive"] }, // Filter for "inactive" status
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdDelearId",
          foreignField: "_id",
          as: "createdDealerRecord",
        },
      },
      {
        $unwind: {
          path: "$createdDealerRecord",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$updatedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users", 
          localField: "updatedBy.id", 
          foreignField: "_id", 
          as: "userDetails", 
        },
      },
      {
        $addFields: {
          DelearDeviceCount: { $size: "$userDevices" },
        },
      },
      {
        $addFields: {
          userDevicesCount: { $size: "$userDevices" },
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "userDetails.time": "$updatedBy.time", 
        },
      },
      {
        $group: {
          _id: "$_id",
         userDetails: { $push: {
            Name: "$userDetails.Name", 
            emailAddress: "$userDetails.emailAddress", 
            createdAt: "$userDetails.createdAt", 
            time: "$userDetails.updatedAt", 
            uniqueCode: "$userDetails.uniqueCode" 
          } },
          deviceTypeDetail: { $push: "$deviceTypeDetail" },
          Name: { $first: "$Name" },
          uniqueCode: { $first: "$uniqueCode" },
          activeCount: { $first: "$activeCount" },
          inactiveCount: { $first: "$inactiveCount" },
          userDevicesCount: { $first: "$userDevicesCount" },
          userDevices: { $first: "$userDevices" },
          DelearDeviceCount: { $first: "$DelearDeviceCount" },
          emailAddress: { $first: "$emailAddress" },
          phone: { $first: "$phone" },
          dob: { $first: "$dob" },
          gender: { $first: "$gender" },
          address: { $first: "$address" },
          country: { $first: "$country" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pinCode: { $first: "$pinCode" },
          companyId: { $first: "$companyId" },
          password: { $first: "$password" },
          profile: { $first: "$profile" },
          profileId: { $first: "$profileId" },
          role: { $first: "$role" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          firebaseToken: { $first: "$firebaseToken" },
          createdDealerRecord: { $first: "$createdDealerRecord" },
          idno: { $first: "$idno" },
          createdDelearId: { $first: "$createdDelearId" },
          notification: { $first: "$notification" },
          subscribeType: { $first: "$subscribeType" },
          permissions: { $first: "$permissions" },
          otp: { $first: "$otp" }, // Keep the first otp in the group
          idDocument: { $first: "$idDocument" }, // Keep the first idDocument in the group
          Document: { $first: "$Document" }, // Keep the first Document in the group
          updatedBy: { $push: "$updatedBy" }, // Push updatedBy array into the result
        },
      },

      {
        $sort: { updatedAt: -1 }, 
      },
      {
        $skip: offset, 
      },
      {
        $limit: limit, 
      },
    ]);

    // Send response with data and total count
    res.status(200).json({ data, totalCount, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getRecordAddedByDelear = async (req: Request, res: Response) => {
  try {
    const searchTerm = req.body.search || "";
    const limit = req.body.limit || 10; 
    const offset = req.body.offset || 0; 
    const filters = req.body.filter || "";
    const filterpayload = {};

      let delearuserRecord: any = await vehicle.find({
        dealerCode: new mongoose.Types.ObjectId( req.body.createdDelearId),
      });
    
      // Extract ownerID from each record
      let ownerIds: any = delearuserRecord?.map(
        (record: { ownerID: any }) => record.ownerID
      );
    
      if (ownerIds.length > 0) {
        Object.assign(filterpayload, {
          $or: [
            { _id: { $in: ownerIds } },
            req.body.createdDelearId
              ? { createdDelearId: new mongoose.Types.ObjectId( req.body.createdDelearId) }
              : {},
          ],
        });
      } else{
        Object.assign(filterpayload, {
         createdDelearId: new mongoose.Types.ObjectId( req.body.createdDelearId) })
        }
    if (req.body.filter)
      Object.assign(filterpayload, { subscribeType: filters });

    if (req.body.isAppCreated)
      Object.assign(filterpayload, { isAppCreated: req.body.isAppCreated });

    if (req.body.status == true || req.body.status == false)
      Object.assign(filterpayload, { status: req.body.status });

    const totalCount = await subscriber.countDocuments({
      role: req.body.role, // Ensure the role is "User"
      subscribeType: { $in: ["Individual", "Company", "Dealer"] }, // Filter subscribeType as Individual or Company
      $or: [
        { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
        { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
        { phone: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on phone
        { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
      ],
      ...filterpayload
    });

    const data = await subscriber.aggregate([
      {
        $match: {
          role: req.body.role,
          subscribeType: { $in: ["Individual", "Company", "Dealer"] },
          $or: [
            { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
            { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
            { phone: { $regex: searchTerm, $options: "i" } },
            { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
          ],
        },
      },
      {
        $match: filterpayload,
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$ownerID", { $toObjectId: "$$subscriberId" }] },
                    { $eq: ["$dealerCode", { $toObjectId:req.body.createdDelearId }] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "vehicleType",
                localField: "vehicleType",
                foreignField: "_id",
                as: "vehicleTypeDetails",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "dealerCode",
                foreignField: "_id",
                as: "dealerdetail",
              },
            },
            {
              $lookup: {
                from: "Imei",
                localField: "imei",
                foreignField: "imeiNo",
                as: "deviceTypeDetail",
              },
            },
            {
              $unwind: {
                path: "$deviceTypeDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$dealerdetail",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $unwind: {
                path: "$vehicleTypeDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $lookup: {
          from: "UserDevices", // The collection to join
          let: { subscriberId: "$_id" }, // Use the subscriber's ID
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$delearid", "$$subscriberId"] }, // Match by subscriberId
                  ],
                },
              },
            },
          ],
          as: "createdelearrecord", // Alias the resulting records as "createdelearrecord"
        },
      },
      {
        $addFields: {
          activeCount: {
            $size: {
              $filter: {
                input: "$createdelearrecord",
                as: "record",
                cond: { $eq: ["$$record.status", "Active"] }, // Filter for "active" status
              },
            },
          },
          inactiveCount: {
            $size: {
              $filter: {
                input: "$createdelearrecord",
                as: "record",
                cond: { $eq: ["$$record.status", "InActive"] }, // Filter for "inactive" status
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdDelearId",
          foreignField: "_id",
          as: "createdDealerRecord",
        },
      },
      {
        $unwind: {
          path: "$createdDealerRecord",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$updatedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users", 
          localField: "updatedBy.id", 
          foreignField: "_id", 
          as: "userDetails", 
        },
      },
      {
        $lookup: {
          from: "users", // Target collection
          let: { createdById: "$createdBy.id" }, // Pass the `createdBy.id` as a variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$createdById" }] // Convert `createdBy.id` to ObjectId and match
                }
              }
            }
          ],
          as: "createdByUser"
        }
      },
      {
        $addFields: {
          DelearDeviceCount: { $size: "$createdelearrecord" },
        },
      },
      {
        $addFields: {
          userDevicesCount: { $size: "$userDevices" },
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "userDetails.time": "$updatedBy.time", 
        },
      },
      {
        $group: {
          _id: "$_id",
          userDetails: { $push: {
            Name: "$userDetails.Name", 
            emailAddress: "$userDetails.emailAddress", 
            createdAt: "$userDetails.createdAt", 
            time: "$userDetails.updatedAt", 
            uniqueCode: "$userDetails.uniqueCode" 
          } },
          createdByUser: { $push: "$createdByUser" },
          deviceTypeDetail: { $push: "$deviceTypeDetail" },
          Name: { $first: "$Name" },
          contactPerson: { $first: "$contactPerson" },
          PersonDesignation: { $first: "$PersonDesignation" },
          uniqueCode: { $first: "$uniqueCode" },
          activeCount: { $first: "$activeCount" },
          inactiveCount: { $first: "$inactiveCount" },
          userDevicesCount: { $first: "$userDevicesCount" },
          userDevices: { $first: "$userDevices" },
          DelearDeviceCount: { $first: "$DelearDeviceCount" },
          emailAddress: { $first: "$emailAddress" },
          phone: { $first: "$phone" },
          dob: { $first: "$dob" },
          gender: { $first: "$gender" },
          address: { $first: "$address" },
          country: { $first: "$country" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pinCode: { $first: "$pinCode" },
          companyId: { $first: "$companyId" },
          password: { $first: "$password" },
          profile: { $first: "$profile" },
          profileId: { $first: "$profileId" },
          role: { $first: "$role" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          firebaseToken: { $first: "$firebaseToken" },
          createdDealerRecord: { $first: "$createdDealerRecord" },
          idno: { $first: "$idno" },
          createdDelearId: { $first: "$createdDelearId" },
          notification: { $first: "$notification" },
          subscribeType: { $first: "$subscribeType" },
          permissions: { $first: "$permissions" },
          otp: { $first: "$otp" }, // Keep the first otp in the group
          idDocument: { $first: "$idDocument" }, // Keep the first idDocument in the group
          Document: { $first: "$Document" }, // Keep the first Document in the group
          updatedBy: { $push: "$updatedBy" }, // Push updatedBy array into the result
        },
      },

      {
        $sort: { updatedAt: -1 }, 
      },
      {
        $skip: offset, 
      },
      {
        $limit: limit, 
      },
    ]);

    // Send response with data and total count
    res.status(200).json({ data, totalCount, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getDealearSuport = async (req: Request, res: Response) => {
  try {
    let loginuser = req.body;
    const searchTerm = req.body.search || ""; // Default to empty string if no search term provided
    const limit = req.body.limit || 10; // Get limit from request or default to 10
    const offset = req.body.offset || 0; // Get offset from request or default to 0
    const filters = req.body.filter || "";
    const filterpayload = {};
    if (loginuser.loginUserRole == "Dealer") {
      let delearuserRecord: any = await vehicle.find({
        dealerCode: new mongoose.Types.ObjectId(loginuser.uid),
      });

      // Extract ownerID from each record
      let ownerIds = delearuserRecord?.map(
        (record: { ownerID: any }) => record.ownerID
      );

      // Correcting the Object.assign syntax
      Object.assign(filterpayload, { _id: { $in: ownerIds } });

      console.log(ownerIds, "Extracted owner IDs");
    }

    if (req.body.filter)
      Object.assign(filterpayload, { subscribeType: filters });

    if (req.body.isAppCreated)
      Object.assign(filterpayload, { isAppCreated: req.body.isAppCreated });

    if (req.body.status == true || req.body.status == false)
      Object.assign(filterpayload, { status: req.body.status });
    // if (req.body.createdDelearId) {
    //   Object.assign(filterpayload, {
    //     createdDelearId: new mongoose.Types.ObjectId(req.body.createdDelearId),
    //   });
    // }
    const totalCount = await subscriber.countDocuments({
      role: req.body.role, // Ensure the role is "User"
      subscribeType: { $in: ["Individual", "Company"] }, // Filter subscribeType as Individual or Company
      $or: [
        { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
        { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
        { phone: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on phone
        { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
      ],
      ...filterpayload, // Spread the additional filter payload here
    });

    // Now, perform the aggregation to get the actual data
    const data = await subscriber.aggregate([
      {
        $match: {
          role: req.body.role,
          subscribeType: { $in: ["Individual", "Company"] },
          $or: [
            { Name: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on Name
            { emailAddress: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on emailAddress
            { phone: { $regex: searchTerm, $options: "i" } },
            { subscribeType: { $regex: searchTerm, $options: "i" } }, // Case-insensitive search on subscribeType
          ],
        },
      },
      {
        $match: filterpayload,
      },
      {
        $lookup: {
          from: "UserDevices",
          let: { subscriberId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$ownerID", "$$subscriberId"] }],
                },
              },
            },
            {
              $lookup: {
                from: "vehicleType",
                localField: "vehicleType",
                foreignField: "_id",
                as: "vehicleTypeDetails",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "dealerCode",
                foreignField: "_id",
                as: "dealerdetail",
              },
            },
            {
              $lookup: {
                from: "Imei",
                localField: "imei",
                foreignField: "imeiNo",
                as: "deviceTypeDetail",
              },
            },
            {
              $unwind: {
                path: "$deviceTypeDetail",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$dealerdetail",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $unwind: {
                path: "$vehicleTypeDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "userDevices",
        },
      },
      {
        $lookup: {
          from: "UserDevices", // The collection to join
          let: { subscriberId: "$_id" }, // Use the subscriber's ID
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$delearid", "$$subscriberId"] }, // Match by subscriberId
                  ],
                },
              },
            },
          ],
          as: "createdelearrecord", // Alias the resulting records as "createdelearrecord"
        },
      },
      {
        $addFields: {
          activeCount: {
            $size: {
              $filter: {
                input: "$createdelearrecord",
                as: "record",
                cond: { $eq: ["$$record.status", "Active"] }, // Filter for "active" status
              },
            },
          },
          inactiveCount: {
            $size: {
              $filter: {
                input: "$createdelearrecord",
                as: "record",
                cond: { $eq: ["$$record.status", "InActive"] }, // Filter for "inactive" status
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdDelearId",
          foreignField: "_id",
          as: "createdDealerRecord",
        },
      },
      {
        $unwind: {
          path: "$createdDealerRecord",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$updatedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users", // Join the user collection
          localField: "updatedBy.id", // The field from updatedBy to match
          foreignField: "_id", // The field in the user collection to match
          as: "userDetails", // Store matched user details in the userDetails array
        },
      },
      {
        $lookup: {
          from: "users", // Target collection
          let: { createdById: "$createdBy.id" }, // Pass the `createdBy.id` as a variable
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$createdById" }] // Convert `createdBy.id` to ObjectId and match
                }
              }
            }
          ],
          as: "createdByUser"
        }
      },
      
      {
        $addFields: {
          DelearDeviceCount: { $size: "$createdelearrecord" },
        },
      },
      {
        $addFields: {
          userDevicesCount: { $size: "$userDevices" },
        },
      },
      {
        $unwind: {
          path: "$createdByUser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "userDetails.time": "$updatedBy.time", // Add the update time from updatedBy to userDetails
        },
      },
      {
        $group: {
          _id: "$_id",
          userDetails: { $push: {
            Name: "$userDetails.Name", 
            emailAddress: "$userDetails.emailAddress", 
            createdAt: "$userDetails.createdAt", 
            time: "$userDetails.updatedAt", 
            uniqueCode: "$userDetails.uniqueCode" 
          } },
          createdByUser: { $push: "$createdByUser" },
          deviceTypeDetail: { $push: "$deviceTypeDetail" },
          Name: { $first: "$Name" },
          contactPerson: { $first: "$contactPerson" },
          PersonDesignation: { $first: "$PersonDesignation" },
          uniqueCode: { $first: "$uniqueCode" },
          activeCount: { $first: "$activeCount" },
          inactiveCount: { $first: "$inactiveCount" },
          userDevicesCount: { $first: "$userDevicesCount" },
          userDevices: { $first: "$userDevices" },
          DelearDeviceCount: { $first: "$DelearDeviceCount" },
          emailAddress: { $first: "$emailAddress" },
          phone: { $first: "$phone" },
          dob: { $first: "$dob" },
          gender: { $first: "$gender" },
          address: { $first: "$address" },
          country: { $first: "$country" },
          state: { $first: "$state" },
          city: { $first: "$city" },
          pinCode: { $first: "$pinCode" },
          companyId: { $first: "$companyId" },
          password: { $first: "$password" },
          profile: { $first: "$profile" },
          profileId: { $first: "$profileId" },
          role: { $first: "$role" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          firebaseToken: { $first: "$firebaseToken" },
          createdDealerRecord: { $first: "$createdDealerRecord" },
          idno: { $first: "$idno" },
          createdDelearId: { $first: "$createdDelearId" },
          notification: { $first: "$notification" },
          subscribeType: { $first: "$subscribeType" },
          permissions: { $first: "$permissions" },
          otp: { $first: "$otp" }, // Keep the first otp in the group
          idDocument: { $first: "$idDocument" }, // Keep the first idDocument in the group
          Document: { $first: "$Document" }, // Keep the first Document in the group
          updatedBy: { $push: "$updatedBy" }, // Push updatedBy array into the result
        },
      },
      // {
      //   $project: {
      //     _id: 1,
      //     Name: 1,
      //     uniqueID: 1,
      //     activeCount:1,
      //     inactiveCount:1,
      //     emailAddress: 1,
      //     phone: 1,
      //     dob: 1,
      //     gender: 1,
      //     address: 1,
      //     country: 1,
      //     state: 1,
      //     city: 1,
      //     pinCode: 1,
      //     companyId: 1,
      //     profile: 1,
      //     profileId: 1,
      //     role: 1,
      //     status: 1,
      //     createdAt: 1,
      //     updatedAt: 1,
      //     firebaseToken: 1,
      //     idno: 1,
      //     notification: 1,
      //     subscribeType: 1,
      //     permissions: 1,
      //     otp: 1,
      //     idDocument: 1,
      //     Document: 1,
      //     updatedBy: 1,
      //     userDetails: 1,
      //     password: 1, // Hide password
      //   }
      // },

      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $skip: offset, // Skip the number of documents specified by offset
      },
      {
        $limit: limit, // Limit the number of documents returned
      },
    ]);

    // Send response with data and total count
    res.status(200).json({ data, totalCount, message: "success" });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
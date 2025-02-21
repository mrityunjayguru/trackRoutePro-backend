import { Request, Response } from "express";
import { suport,users } from "./_validation"; // Adjust the import path according to your project structure
import helper from "../../../helper";
import {SuportTickeRais} from "../../../MailBody/SuportTickeRais"
import {SuportResolvedMail} from "../../../MailBody/SuportResolvedMail"
import {SuportReject} from "../../../MailBody/SuportReject"

import mongoose from "mongoose";


export const create = async (req: Request, res: Response) => {
  let data: any;
  try {
    data = await suport.create({ ...req.body });
      
     let userdata:any=await users.findOne({_id:req.body.userID})
        const emailpayload: any = {
          to: userdata?.emailAddress,
          subject: `Support Request from ${userdata?.emailAddress}`,
          body: SuportTickeRais(data,userdata),
        };
       await helper.sendEmail(emailpayload)
       res.status(200).json({ data: data, message: "success", status: 200 });
  } catch (error) {
    console.error("Error fetching suports:", error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};

export const get = async (req: Request, res: Response) => {
  let data: any;
  const searchTerm = req.body.search || "";
  let payload: any = {};

  // Apply filter if provided
  if (req.body.filter) {
    Object.assign(payload, { status: req.body.filter });
  }

  // Pagination variables
  const limit = parseInt(req.body.limit) || 10; // Default to 10
  const offset = parseInt(req.body.offset) || 0; // Default to 0

  try {
    // Create a regex search filter for searching deviceID or user data
    const searchFilter = {
      $or: [
        { deviceID: { $regex: searchTerm, $options: "i" } },
        { "userdata.Name": { $regex: searchTerm, $options: "i" } },
        { "userdata.emailAddress": { $regex: searchTerm, $options: "i" } },
        { "userdata.phone": { $regex: searchTerm, $options: "i" } },
      ],
    };

    // First, get the total count of documents matching the criteria including filters
    const totalCount = await suport.aggregate([
      {
        $match: { ...payload }, // Apply filters
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userdata",
        },
      },
      {
        $unwind: {
          path: "$userdata",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: searchFilter, // Apply search filters
      },
      {
        $count: "totalCount" // Count total documents after filtering
      }
    ]);

    // Fetch the paginated data
    data = await suport.aggregate([
      {
        $match: { ...payload }, // Apply filters
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userdata",
        },
      },
      {
        $unwind: {
          path: "$userdata",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: searchFilter, // Apply search filters
      },
      {
        $sort: { updatedAt: -1 }, // Sort by createdAt in descending order to get the latest first
      },
      {
        $skip: offset, // Skip the specified number of documents
      },
      {
        $limit: limit, // Limit the number of documents returned
      }
    ]);

    // Extract total count from the first aggregation
    const total = totalCount.length > 0 ? totalCount[0].totalCount : 0;

    // Send the response with data and total count
    res.status(200).json({ data, totalCount:total, message: "success", status: 200 });
  } catch (error) {
    console.error("Error fetching supports:", error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
};





export const update = async (req: Request, res: Response) => {
  try {
    const payload: Record<string, any> = {};

    // Check and assign the status if provided
    if (req.body.status) {
      payload.status = req.body.status;
    }

    // Always update the updatedAt field
    payload.updatedAt = new Date();

    // Ensure _id is an ObjectId type (for MongoDB compatibility)
    const objectIds =  new mongoose.Types.ObjectId(req.body._id);

    // Update the support ticket in the database
    const result = await suport.updateOne({ _id: req.body._id }, payload);

    // Retrieve the updated support record
    const suportRecord: any = await suport.findOne({ _id: objectIds });
    console.log(objectIds, "suportRecordsuportRecordsuportRecord");

    // Get the user data based on userID from the support record
    const userdata: any = await users.findOne({ _id: new mongoose.Types.ObjectId(suportRecord.userID),role:"User" });

    // Send email if status is "Resolved"
    if (req.body.status === "Resolved") {
      const emailpayload: any = {
        to: userdata?.emailAddress,
        subject: `Support Resolved for ${suportRecord?.ticketID}`,
        body: SuportResolvedMail(userdata, suportRecord),
      };

      // Send the email
      await helper.sendEmail(emailpayload);
    }
    if (req.body.status === "Rejected") {
      const emailpayload: any = {
        to: userdata?.emailAddress,
        subject: `Update on Your Support Request`,
        body: SuportReject(userdata, suportRecord,req.body),
      };

      // Send the email
      await helper.sendEmail(emailpayload);
    }
    return res.status(200).json({ message: "success", data: result });
  } catch (error) {
    console.error("Error updating support:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



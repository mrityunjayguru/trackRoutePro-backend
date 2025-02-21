import schedule from "node-schedule";
import { vehicleTrackingSchema } from "../models/tracking";
import { VehicletrackingLogsSchema } from "../models/VehicletrackingLogs";
import { vehicleDetailsSchema } from "../models/Vehicle";
// import path from "path"
import { model } from "mongoose";

import * as xlsx from "xlsx";
import fs from "fs";
import { uploadFile } from "./awsS3";
import { ExpirySubscriptionMail } from "../MailBody/ExpirySubscriptionMail";
import helper from "../helper";
// Define models
const tracking = model("tracking", vehicleTrackingSchema);
const UserDevices = model("UserDevices", vehicleDetailsSchema);

const VehicletrackingLogs = model(
  "VehicletrackingLogs",
  VehicletrackingLogsSchema
);

// Scheduler function
export const scheduleTask = () => {
  schedule.scheduleJob("0 * * * *", async () => {
    try {
      const startTime = Date.now(); // Record the start time of the task

      // Get the seconds (0 to 59)

      // Aggregation pipeline
      const data = await tracking.aggregate(
        [
          {
            $sort: { createdAt: -1 }, // Sort by creation date (latest first)
          },
          {
            $limit: 30000,
          },
          {
            $group: {
              _id: "$deviceID", // Group by deviceID
              records: {
                $push: {
                  _id: "$_id",
                  temperature: "$temperature",
                  createdAt: "$createdAt",
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              records: {
                $slice: ["$records", 1, { $size: "$records" }], // Skip the first record (latest one) and return the rest
              },
            },
          },
        ],
        { allowDiskUse: true }
      );

      let pusharr: any[] = [];

      // Process results and prepare for insertion
      data.forEach((val: any) => {
        pusharr = [...pusharr, ...val.records];
      });

      console.log("Total records to process:", pusharr.length);

      // Batch insert records into VehicletrackingLogs
      // const batchSize = 1000;
      // for (let i = 0; i < pusharr.length; i += batchSize) {
      //   const batch = pusharr.slice(i, i + batchSize);
      //   try {
      //     await VehicletrackingLogs.insertMany(batch, { ordered: false });
      //     // console.log(`Inserted batch ${i / batchSize + 1} of size ${batch.length}`);
      //   } catch (insertErr) {
      //     console.error(
      //       `Error inserting batch ${i / batchSize + 1}:`,
      //       insertErr
      //     );
      //   }
      // }

      // Collect the IDs of the inserted records
      const insertedIds = pusharr.map((record: any) => record._id);

      // Delete the records from the tracking collection that were just inserted
      await tracking.deleteMany({
        _id: { $in: insertedIds }, // Match the _id of the records inserted into VehicletrackingLogs
      });

      const endTime = Date.now(); // Record the end time of the task
      const executionTime = (endTime - startTime) / 1000; // Calculate execution time in seconds
      console.log(`Task executed in ${executionTime} seconds.`);
    } catch (err) {
      console.error(
        "Error during aggregation, insertion, or deletion:",
        JSON.stringify(err)
      );
    }
  });
};

export const scheduleTask2 = async () => {
  schedule.scheduleJob("0 0 * * *", async () => {
    try {
      // Calculate the date range (4 days ago to 1 day ago)
      const now = new Date();
      const fourDaysAgo = new Date(now.setDate(now.getDate() - 4)).setHours(
        0,
        0,
        0,
        0
      ); // 4 days ago (at midnight)
      const oneDayAgo = new Date(now.setDate(now.getDate() - 1)).setHours(
        0,
        0,
        0,
        0
      ); // 1 day ago (at midnight)

      const data = await VehicletrackingLogs.aggregate(
        [
          {
            $match: {
              createdAt: {
                $gte: new Date(fourDaysAgo), // from 4 days ago
                $lt: new Date(oneDayAgo), // until 1 day ago (exclusive)
              },
            },
          },
        ],
        { allowDiskUse: true }
      );

      await createExcelFile(data);

      // Delete the records after processing
      const insertedIds = data.map((record) => record._id);
      await VehicletrackingLogs.deleteMany({
        _id: { $in: insertedIds },
      });
    } catch (err) {
      console.error(err);
    }
  });
};

const createExcelFile = async (data: any[]) => {
  const modifiedData = data.map((item) => {
    if (item._id && typeof item._id.toString === "function") {
      item._id = item._id.toString();
    }
    return item;
  });

  const ws = xlsx.utils.json_to_sheet(modifiedData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Sheet 1");

  xlsx.writeFile(wb, "output.xlsx");

  const mydata = fs.readFileSync("output.xlsx");

  const currentDate = new Date();
  const formattedDate =
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(currentDate.getDate()).padStart(2, "0")}_` +
    `${String(currentDate.getHours()).padStart(2, "0")}-${String(
      currentDate.getMinutes()
    ).padStart(2, "0")}-` +
    `${String(currentDate.getSeconds()).padStart(2, "0")}`;

  let filename = `trackingData_${formattedDate}.xlsx`;
  const fileObject = {
    file: mydata,
    filename: filename,
  };
  await uploadFile(fileObject);
};

export const sendNotificationBefore7Days = () => {
  schedule.scheduleJob("0 0 0 * * *", async () => {
    try {
      // const startTime = Date.now();

      const currentDate = new Date(); // Current date and time
      const sevenDaysFromNow = new Date(currentDate);
      sevenDaysFromNow.setDate(currentDate.getDate() + 360); // Add 7 days to the current date

      const data = await UserDevices.aggregate(
        [
          {
            $match: {
              subscriptionexp: {
                // Match expDate within the next 7 days
                $gte: currentDate, // expDate should be greater than or equal to today
                $lte: sevenDaysFromNow, // expDate should be less than or equal to 7 days from now
              },
            },
          },
          {
            $lookup: {
              from: "users", // Join with the 'users' collection
              localField: "ownerID", // Field in the current collection to match
              foreignField: "_id", // Field in the 'users' collection to match
              as: "userDetails", // Name of the new array field with matched documents
            },
          },
          {
            $unwind: "$userDetails", // Deconstruct the 'userDetails' array into individual documents
          },
          {
            $sort: { createdAt: -1 }, // Sort by createdAt field in descending order
          },
          {
            $project: {
              imei: 1,
              subscriptionexp: 1,
              ownerID: 1,
              "userDetails.firebaseToken": 1,
              "userDetails.Name": 1,
              "userDetails.emailAddress": 1,
            }, // Limit the number of documents to 30,000
          },
        ],
        { allowDiskUse: true }
      );
      data.map(async (val, i) => {
        const emailpayload: any = {
          to: val.userDetails.emailAddress,
          subject: `Subscription Reminder`,
          body: ExpirySubscriptionMail(val),
        };
        await helper.sendEmail(emailpayload);
      });

      // const endTime = Date.now(); // Record the end time of the task
      // const executionTime = (endTime - startTime) / 1000;
      // console.log(`Task executed in ${executionTime} seconds.`);
    } catch (err) {
      console.error(
        "Error during aggregation, insertion, or deletion:",
        JSON.stringify(err)
      );
    }
  });
};

export const UploadAndcreateExcelFile = async (data: any[], name: any) => {
  try {
    // Modify the data to ensure any object IDs are converted to strings
    const modifiedData = data.map((item) => {
      if (item._id && typeof item._id.toString === "function") {
        item._id = item._id.toString();
      }
      return item;
    });

    // Create the worksheet from the data
    const ws = xlsx.utils.json_to_sheet(modifiedData);

    // Create a new workbook and append the worksheet
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Sheet 1");

    // Convert the workbook to a buffer in memory
    const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    // Create a unique filename based on the current date and time
    const currentDate = new Date();
    const formattedDate =
      `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}_` +
      `${String(currentDate.getHours()).padStart(2, "0")}-${String(
        currentDate.getMinutes()
      ).padStart(2, "0")}-` +
      `${String(currentDate.getSeconds()).padStart(2, "0")}`;

    const filename = `${name}_${formattedDate}.csv`;

    // Prepare the file object with buffer and filename
    const fileObject = {
      file: buffer,
      filename: filename,
    };

    // Upload the file using your upload function
    let files = await uploadFile(fileObject);
    console.log(files, "files");

    // Return the upload result
    return files;
  } catch (err) {
    console.error("Error creating or uploading the Excel file:", err);
    throw new Error("Internal Server Error");
  }
};

import mongoose from "mongoose";

function flattenObject(obj: any, parentKey: any = "", result: any = {}) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let newKey = parentKey ? `${parentKey}.${key}` : key;

      if (obj[key] instanceof mongoose.Types.ObjectId) {
        result[newKey] = obj[key].toString(); // Convert ObjectId to string
      } else if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObject(obj[key], newKey, result);
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          if (item instanceof mongoose.Types.ObjectId) {
            result[`${newKey}[${index}]`] = item.toString();
          } else if (typeof item === "object" && item !== null) {
            flattenObject(item, `${newKey}[${index}]`, result);
          } else {
            result[`${newKey}[${index}]`] = item;
          }
        });
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}

export const DownloadExcelForMongoDB = async (
  data: any,
  filename = "exported_data"
) => {
  try {
    const flattenedData = data.map((item: any) => flattenObject(item));
    const modifiedData = flattenedData.map(
      (item: { _id: { toString: () => any }; id: { toString: () => any } }) => {
        if (item._id && typeof item._id.toString === "function") {
          item._id = item._id.toString();
        }
        if (item.id && typeof item.id.toString === "function") {
          item.id = item.id.toString();
        }
        return item;
      }
    );

    const ws = xlsx.utils.json_to_sheet(modifiedData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Sheet 1");
    const buffer = xlsx.write(wb, { bookType: "csv", type: "array" });
    const fileBuffer = Buffer.from(buffer);
    
    const currentDate = new Date();
    const formattedDate =
      `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}_` +
      `${String(currentDate.getHours()).padStart(2, "0")}-${String(
        currentDate.getMinutes()
      ).padStart(2, "0")}-` +
      `${String(currentDate.getSeconds()).padStart(2, "0")}`;
    const finalFilename = `${filename}_${formattedDate}.csv`;
    const fileObject = {
      file: fileBuffer,
      filename: finalFilename,
    };
    let files = await uploadFile(fileObject);
    return files;
  } catch (err) {
    console.error("Error creating Excel file:", err);
    throw new Error("Internal Server Error");
  }
};

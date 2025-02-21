import { Request, Response } from "express";
import { notification, User, Alearts } from "./_validation";
import _ from "lodash";
import Helper from "../../../helper";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

let data: any;
export const create = async (req: Request, res: Response) => {
  try {
    data = await notification.create({
      ...req.body,
      createdAt: new Date().toISOString(),
    });
    if (req.body.sendTo == "All") {
      await sentNotificationToAll(req);
    }
    res.status(200).json({ data: data, message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const sentNotificationToAll = async (req: any) => {
  try {
    // Retrieve users with firebaseToken
    const data = await User.aggregate([
      {
        $match: {
          role: "User",
        },
      },
      {
        $project: {
          firebaseToken: 1,
        },
      },
    ]);
    console.log(data, "datadata");

    // Extract firebaseTokens from the data

    // Prepare all notification promises
    data.map(async (data: any) => {
      console.log(data?.firebaseToken);
      const notificationPayload: any = {
        notification: {
          title: req.body.title,
          body: req.body.message,
        },
        token: data?.firebaseToken, // Send the token directly
        data: {},
        android: {
          notification: {
            channel_id: "track_route_pro_channel", // NOTIFICATION CHANNEL ID WITH CUSTOM SOUND REFERENCE HERE
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "message_alert.mp3",
            },
          },
        },
      };

      if (req.body.urgency) {
        Object.assign(notificationPayload.data, {
          colorcode: req.body.urgency,
        });
      }

      // Send the notification and return the promise
      try {
        if (data?.firebaseToken) {
          await Helper.sendPushNotification(notificationPayload);
        }
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log("Error retrieving users or sending notifications:", err);
  }
};

export const get = async (req: Request, res: Response) => {
  const limit = Math.min(Math.max(parseInt(req.body.limit) || 10));
  const offset = Math.max(parseInt(req.body.offset) || 0);
  try {
    const totalCount = await notification.countDocuments();
    const data: any = await notification.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "users.user",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $project: {
          id: 1,
          title: 1,
          message: 1,
          urgency: 1,
          sendTo: 1,
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          result: {
            $map: {
              input: "$result",
              as: "user",
              in: { name: "$$user.Name" },
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]);

    res.status(200).json({
      data,
      totalCount,
      message: "success",
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      message: "Internal Server Error",
      status: 500,
    });
  }
};

export const update = async (req: Request, res: Response) => {
  let updatenotification: any = await notification.findOne({
    _id: req.body._id,
  });
  if (!updatenotification)
    return res.status(404).json({ message: "No record found." });
  let payload = {};
  if (req.body.description)
    Object.assign(payload, { description: req.body.description });
  data = await notification.updateOne({ _id: req.body._id }, payload);
  res.status(200).json({ data: data, message: "success" });
};

export const alerts = async (req: Request, res: Response) => {
  try {
    // Validate input
    if (!req.body.ownerID) {
      return res
        .status(400)
        .json({ message: "The 'ownerID' field is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.ownerID)) {
      return res
        .status(400)
        .json({ message: "'ownerID' must be a valid ObjectId." });
    }

    const payload = {
      isDeleted: false,
      ownerID: new mongoose.Types.ObjectId(req.body.ownerID),
    };

    // Fetch latest alerts without grouping
    const data = await Alearts.aggregate([
      { $match: payload },
      { $sort: { createdAt: -1 } }, // Sort alerts by creation date (descending)
      {
        $lookup: {
          from: "UserDevices",
          let: { imei: "$imei" },
          pipeline: [
            { $match: { $expr: { $eq: ["$imei", "$$imei"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "DeviceDetails",
        },
      },
      { $unwind: { path: "$DeviceDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          notificationalert: 1,
          alertfor: 1,
          location: 1,
          deviceId: 1,
          imei: 1,
          createdAt: 1,
          deviceDetails: {
            _id: "$DeviceDetails._id",
            vehicleRegistrationNo: "$DeviceDetails.vehicleRegistrationNo",
            fuel: "$DeviceDetails.fuel",
            vehicleNo: "$DeviceDetails.vehicleNo",
            deviceId: "$DeviceDetails.deviceId",
            imei: "$DeviceDetails.imei",
            vehicleType: "$DeviceDetails.vehicleType",
            vehicleBrand: "$DeviceDetails.vehicleBrand",
            vehicleModel: "$DeviceDetails.vehicleModel",
            maxSpeed: "$DeviceDetails.maxSpeed",
            Area: "$DeviceDetails.Area",
            parking: "$DeviceDetails.parking",
            location: "$DeviceDetails.location",
          },
        },
      },
    ]);
    return res.status(200).json({ data, message: "Success" });
  } catch (err) {
    console.error("Error fetching alerts:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err,
    });
  }
};

export const Delete = async (req: Request, res: Response) => {
  let data: any;

  data = await notification.deleteOne({ _id: req.body._id });
  res
    .status(Helper.Statuscode.Success)
    .json({ data: data, message: "success" });
};

export const notificationByID = async (req: Request, res: Response) => {
  try {
    const userID = new ObjectId(req.body._id); // Convert to ObjectId

    const notifications: any = await notification.aggregate([
      {
        $match: {
          $or: [
            { "users.user": userID }, // Match the user's ID in the users array
            { sendTo: "All" }, // Also include notifications sent to "All"
          ],
        },
      },
      {
        $lookup: {
          from: "users", // Collection to join (users)
          localField: "users.user", // Field from 'notification' (user ID in the users array)
          foreignField: "_id", // Field from 'users' collection (matching user ID)
          as: "userDetails", // Alias for the joined user data
        },
      },
      {
        $unwind: {
          path: "$userDetails", // Unwind to flatten the userDetails array
          preserveNullAndEmptyArrays: true, // Ensure notifications with no user details are still returned
        },
      },
      {
        $match: {
          // After lookup, filter by userID if needed
          $or: [
            { "userDetails._id": userID }, // Only include if the logged-in user matches
            { sendTo: "All" }, // Also include notifications sent to "All"
          ],
        },
      },
    ]);

    return res.status(200).json({
      status: 200,
      message: "success",
      data: notifications, // Send back the enriched notification data
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

export const sendPushNotification = async (req: Request, res: Response) => {
  let data: any;

  try {
    // Aggregate notifications with pending user statuses
    data = await notification.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "users.user", // Field from the Notification model
          foreignField: "_id", // Field from the User model
          as: "userDetails",
        },
      },
      {
        $unwind: "$users", // Unwind users to get individual user documents
      },
      {
        $match: {
          "users.status": "Pending", // Match only those with 'Pending' status
        },
      },
    ]);

    // Use a Promise.all to send notifications concurrently
    const notificationPromises = data.map(async (val: any) => {
      if (
        val.userDetails &&
        val.userDetails.length > 0 &&
        val.userDetails[0].firebaseToken
      ) {
        const notificationPayload: any = {
          notification: {
            title: val.title,
            body: val.message,
          },
          token: val.userDetails[0].firebaseToken,
          data: {},
          android: {
            notification: {
              channel_id: "track_route_pro_channel", // NOTIFICATION CHANNEL ID WITH CUSTOM SOUND REFERENCE HERE
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "message_alert.mp3",
              },
            },
          },
        };

        if (val.urgency) {
          Object.assign(notificationPayload.data, { colorcode: val.urgency });
        }

        try {
          // Send notification
          const notificationResult: any = await Helper.sendPushNotification(
            notificationPayload
          );
          console.log(notificationResult, "notificationResult");

          if (notificationResult.status === "success") {
            // Successfully sent notification, return success status
            return {
              notificationId: val._id,
              userId: val.userDetails[0]._id,
              status: "success", // Mark as success
            };
          } else {
            // If the notification didn't succeed, return failure status
            return {
              notificationId: val._id,
              userId: val.userDetails[0]._id,
              status: "failed", // Mark as failed
            };
          }
        } catch (error) {
          console.error("Error sending notification:", error);
          // In case of error in sending notification, mark it as failed
          return {
            notificationId: val._id,
            userId: val.userDetails[0]._id,
            status: "failed", // Mark as failed
          };
        }
      }
      return null;
    });

    // Wait for all notifications to be processed
    const results = await Promise.all(notificationPromises);

    // Filter out unsuccessful results
    const successfulUpdates = results.filter(Boolean);

    // Prepare bulk update operations based on the success/failure of sending notifications
    const bulkOps = successfulUpdates.map((item) => {
      if (item.status === "success") {
        return {
          updateOne: {
            filter: { _id: item.notificationId, "users.user": item.userId },
            update: { $set: { "users.$.status": "success" } },
          },
        };
      } else {
        return {
          updateOne: {
            filter: { _id: item.notificationId, "users.user": item.userId },
            update: { $set: { "users.$.status": "failed" } },
          },
        };
      }
    });

    // Perform bulk update for all notifications
    if (bulkOps.length > 0) {
      await notification.bulkWrite(bulkOps);
    }

    return res.status(200).json({
      status: 200,
      message: "Notifications sent successfully",
      data: successfulUpdates, // Optional: Send back the enriched notification data
    });
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while sending notifications",
    });
  }
};

import { Request, Response } from "express";
import { user, device,Alearts,deviceType } from "./_validation"; // Assuming these are your Mongoose models
import _ from "lodash"; // Consider removing if unused
import moment  from "moment";
export const getDashboard = async (req: Request, res: Response) => {
  try {
    // Count total users with role "User"
    const userCounts = await user.aggregate([
      {
        $match: {
          role: "User",
          subscribeType:{$in:["Individual","Company"]}
        },
      },
      {
        $facet: {
          totalUsers: [
            {
              $count: "count",
            },
          ],
          individualUsers: [
            {
              $match: {
                subscribeType: "Individual",
              },
            },
            {
              $count: "count",
            },
          ],
          companyUsers: [
            {
              $match: {
                subscribeType: "Company",
              },
            },
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    // Count total users with role "Admin"
    const adminRoleCount = await user.aggregate([
      {
        $match: {
          role: "Admin",
        },
      },
      {
        $count: "totalUsers",
      },
    ]);

    // Group devices by status and count them using $facet for total count and grouping
    const groupDevices = await device.aggregate([
      {
        $facet: {
          totalDevices: [
            {
              $count: "total", // Count total devices
            },
          ],
          groupedByStatus: [
            {
              $group: {
                _id: "$status", // Group by the status field
                count: { $sum: 1 }, // Count the number of records for each status
              },
            },
          ],
        },
      },
    ]);

    const fifteenDaysAgo = moment().add(15, 'days').toDate();

    // Count subscribers grouped by their status
    const subscriberExp = await device.aggregate([
      {
        $match: {
          subscriptionexp: { $lte: fifteenDaysAgo } // Match documents where subscriptionexp is within the last 15 days
        }
      },
      {
        $count: "expcount", // The name of the output field containing the count
      },
    ]);
      
    
    // Count total notifications
    const notificationCount = await Alearts.aggregate([
      {
        $count: "totalNotifications", // The name of the output field containing the count
      },
    ]);

     const deviceTypes=await deviceType.aggregate([
      {
        $count: "totalNotifications", // The name of the output field containing the count
      },
     ])

    // Prepare the response data
    const totalDevices = groupDevices[0]?.totalDevices[0]?.total || 0; // Get the total count of devices
    const groupedStatus = groupDevices[0]?.groupedByStatus || []; // Get the counts grouped by status
    let result = [0, 0];
    groupedStatus?.forEach((item:any) => {
      if (item._id === 'Active') {
        result[0] = item.count; 
      } else if (item._id === 'Inactive') {
        result[1] = item.count; 
      }
    });
    let records = {
      deviceTypes:deviceTypes,
      // userCount: userCount.length > 0 ? userCount[0].totalUsers : 0, // Default to 0 if no users found
      totalUsers: userCounts[0].totalUsers[0]?.count || 0,
      individualUsers: userCounts[0].individualUsers[0]?.count || 0,
      companyUsers: userCounts[0].companyUsers[0]?.count || 0,
      groupDevices: { totalCount: totalDevices, groupedStatus: groupedStatus,result:result },
      adminRoleCount:
        adminRoleCount.length > 0 ? adminRoleCount[0].totalUsers : 0, // Default to 0 if no admins found
      subscriberExp: subscriberExp.length > 0 ? subscriberExp[0].expcount : 0,
      notificationCount:
        notificationCount.length > 0
          ? notificationCount[0].totalNotifications
          : 0, // Default to 0 if no notifications found
    };

    // Send response
    res.status(200).json({ data: records, message: "success" });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

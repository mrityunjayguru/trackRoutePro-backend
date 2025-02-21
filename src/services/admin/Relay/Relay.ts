import { Request, Response } from "express";
import _ from "lodash";
import axios from 'axios';
import {relay,vehicle} from "./_validation"
// import { io, users } from './socket/setup';

export const engineResume = async (req: Request, res: Response) => {
  let data:any;
   data=await handleAuthincate()


 const payload={
  token:data.token,
  device_imei: req.body.imei,
  type: "engineResume"
 }
  data =await HandleApiFunction("https://prod-s2.track360.net.in/api/v1/auth/set_owl_mode_v1",payload,"post")
  const existingRecord:any = await relay.findOne({ deviceid: req.body.deviceId });

  if (!existingRecord) {
      // Create a new record if none is found
      const newRecord: any = new relay({
          deviceid: req.body.imei,
          taskId: data.task_id,
      });
      await newRecord.save();
 await vehicle.updateOne(
  { imei: req.body.imei }, // Filter condition
  { $set: { immobiliser: "Start" } } // Update operation
);


  } else {
      // Update the existing record's taskId
      existingRecord.taskId = data.task_id;
      await existingRecord.save();
 let ress=await vehicle.updateOne(
  { imei: req.body.imei }, // Filter condition
  { $set: { immobiliser: "Start" } } // Update operation
);
console.log(ress,"ressressress")

  }
  
  res.status(200).json({ data: data, message: "success" ,status:200});
};

export const engineStop = async (req: Request, res: Response) => {
  let data:any;
  data=await handleAuthincate()
  const payload={
   token:data.token,
   device_imei: req.body.imei,
   type: "engineStop"
  }

  
   data =await HandleApiFunction("https://prod-s2.track360.net.in/api/v1/auth/set_owl_mode_v1",payload,"post")
   const existingRecord:any = await relay.findOne({ deviceid: req.body.deviceId });

   if (!existingRecord) {
       // Create a new record if none is found
       const newRecord: any = new relay({
           deviceid: req.body.imei,
           taskId: data.task_id,
       });
      await vehicle.updateOne(
        { imei: req.body.imei }, // Filter condition
        { $set: { immobiliser: "Stop" } } // Update operation
      );
      

       await newRecord.save();
   } else {
       // Update the existing record's taskId
       existingRecord.taskId = data.task_id;
       await existingRecord.save();
       await vehicle.updateOne(
        { imei: req.body.imei }, // Filter condition
        { $set: { immobiliser: "Stop" } } // Update operation
      );

   }
  res.status(200).json({ data: data, message: "success" });
};



export const checkStatus = async (req: Request, res: Response) => {
  let data: any;
  data=await handleAuthincate()
const payload={
  token:data.token,
}
const existingRecord:any = await relay.findOne({ deviceid: req.body.imei });
 data =await HandleApiFunction(`https://prod-s2.track360.net.in/api/v1/auth/get_task_status?task_id=${existingRecord.taskId}`,payload,"get")
  res.status(200).json({ data: data?.data, message: "success" });
};

const HandleApiFunction = async (URL: string, payload: any, method: string) => {
  try {
    // Prepare the config object based on the method
    let requestConfig: any = {
      url: URL,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: payload?.token, // Include token if present
      },
    };

    // If method is GET, append payload as query parameters to the URL
    if (method=="post") {
      requestConfig.data = payload;
    } 

    // Pass the whole requestConfig to axios
    const response = await axios(requestConfig);

    return response.data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};


const handleAuthincate=async()=>{
  const payload={
    username: "DesignDemonz",
    password: "JaiHanumanJi@89"
}
  let data =await HandleApiFunction("https://prod-s2.track360.net.in/api/v1/auth/login",payload,"post")

  return data
}
import { model } from "mongoose";
import { adminSchema } from "../models/admin";

// import { scheduleSchema } from "../models/schedule";
import { usersSchema } from "../models/users";
import {bannerSchema} from "../models/banner"
import {vehicleDetailsSchema} from "../models/Vehicle"


export default () => {
  model("Admin", adminSchema);
  model("Users", usersSchema);
  model("banner", bannerSchema);
  model("vehicleDetails", vehicleDetailsSchema);


};

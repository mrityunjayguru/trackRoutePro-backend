import { model } from "mongoose";
import { scheduleSchema } from "../../../models/schedule";

export const Schedule = model("Schedule", scheduleSchema);

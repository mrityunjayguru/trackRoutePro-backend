import { model } from "mongoose";
import { tokenNoSchema } from "../../../models/tokenNo";

export const TokenNo = model("TokenNo", tokenNoSchema);

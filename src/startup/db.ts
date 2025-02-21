import mongoose from "mongoose";
import config from "config";

export default async () => {
  try {
    if (config.has("dbUrl")) {
      const db: string = config.get("dbUrl");
      await mongoose.connect(db);
      mongoose.set("strictQuery", true);
      console.log("Database Connected Successfully...");
    } else {
      console.log("Unable to connect database, please try again later");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

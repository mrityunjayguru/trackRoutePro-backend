import cors from "cors";
import express, { Application, json, Request, Response } from "express";
import helmet from "helmet";
import { errorHandler } from "../middleware/error";
import router from "../services/routes";
import path from "path";

export default (app: Application) => {
  app.use(helmet());
  app.use(json());
  app.use(cors());
  app.use((Request, Response, next) => {
    Response.header("Access-Control-Allow-Origin", "*"); // Adjust as necessary
    Response.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    Response.header("Access-Control-Expose-Headers", "x-auth-token"); // Expose the custom header
    next();
  });
  app.use(express.json({ limit: "10mb" })); // Adjust the size as per your requirement
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use("/files", express.static(path.join(__dirname, "../../files")));
  app.use("/", router);
  app.use((req: Request, res: Response) => {
    res.status(404).json({ message: "URL not found." });
  });

  app.use(errorHandler);
};

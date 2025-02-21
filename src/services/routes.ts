import express from "express";
import userLogin from "./users/login/_router";
import banner from "./admin/banner/_router"
import vehicleDetails from "./admin/Vehicle/VehicleDetails/_router"
import middleware from "../middleware";
import profile from "./users/profile/_router"
import tracking from "./admin/Vehicle/vehicleTrackingDetails/_router"
import vehicletype from "./admin/Vehicle/VehicleType/_router"
import splashAd from "./admin/splashAd/_router"
import setting from "./admin/setting/_router"
import about from "./admin/aboutUs/_router"
import privacyPolicy from "./admin/privacyPolicy/_router"
import faqtopics from "./admin/FaQTopics/_router"
import faqlist from "./admin/FaQList/_router"
import  Notification  from "./admin/notification/_router";
import subscribers from "./admin/Subscribers/_router"
import dashboard from "./admin/dashboard/_router"
import suport from "./admin/suport/_router"
import admin from "./admin/admin/_router"
import managesetting from "./manageSetting/_router"
import login from "./admin/login/_router"
import {userAuth} from "../middleware/auth"
import Relay from "./admin/Relay/_router"
import deviceType from "./admin/deviceType/_router"
import Imei from "./admin/Imei/_router"
import termAndCondition from "./admin/termAndCondition/_router"
import download from "./Download/_router"
const app = express();
app.use("/Auth", userLogin);
app.use("/trackVehicle", tracking);
app.use("/banner",middleware.isAuth, banner);
app.use("/user",userAuth, profile);
app.use("/vehicle",userAuth, vehicleDetails);
app.use("/vehicleType",userAuth, vehicletype);
app.use("/splashAd", splashAd);
app.use("/setting",userAuth, setting);
app.use("/about",userAuth, about);
app.use("/privacyPolicy",privacyPolicy);
app.use("/FaQtopic",userAuth, faqtopics);
app.use("/FaQlist",userAuth, faqlist);
app.use("/notification", Notification);
app.use("/subscribers",userAuth, subscribers);
app.use("/dashboard",userAuth, dashboard);
app.use("/suport",userAuth, suport);
app.use("/admin",userAuth, admin);
app.use("/managesetting",userAuth, managesetting);
app.use("/adminAuth", login);
app.use("/Relay",userAuth, Relay);
app.use("/deviceType",userAuth, deviceType);
app.use("/Imei",userAuth, Imei);
app.use("/download",userAuth, download);
app.use("/termAndCondition", termAndCondition);

export default app;

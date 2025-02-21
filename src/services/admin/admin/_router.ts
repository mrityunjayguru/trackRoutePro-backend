import { Router } from "express";
import {
  forgotPassword,
  loginWithEmail,
  loginWithMobile,
  resetPassword,
  sendOtp,
  sendOtpMobile,
  signup,
  verify,
  createAdmin,
  updateUser,
  AllAdmin
} from "./admin";
import middleware from "../../../middleware";
const router = Router();

router.post("/signup", signup);
router.post(
  "/createAdmin",
  middleware.FileUpload("profile"),
  middleware.UploadtoCloud,
  createAdmin
);
router.post("/updateAdmin",
  middleware.FileUpload("profile"),
  middleware.UploadtoCloud,
  updateUser);
router.post("/verify", verify);
router.post("/login", loginWithEmail);
router.post("/login-with-mobile", loginWithMobile);
router.post("/send_otp", sendOtp);
router.post("/send_otp_mobile", sendOtpMobile);
router.post("/forgot_password", forgotPassword);
router.post("/reset_password", resetPassword);
router.post("/All-Admin", AllAdmin);


export default router;

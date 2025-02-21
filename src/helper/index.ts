import Statuscode from "./statusCode";
import {sendEmail} from "./NodeMailer/NodeMailer"
import {generateOTP} from "./GenerateOtp"
import {sendPushNotification} from "./notificationService"
export default{
    Statuscode,
    generateOTP,
    sendPushNotification,
    sendEmail
}
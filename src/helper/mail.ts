import sgMail from "@sendgrid/mail";
import config from "config";

sgMail.setApiKey(config.get("sendgrid_api_key"));

export const mailHandler = async (
  emailAddress: string,
  verificationCode: number
) => {
  try {
    let response: any = await sgMail.send({
      to: emailAddress,
      from: config.get("sendgrid_from_email"),
      subject: "Please verify that its you",
      text: `Please verify that it's you \n\n
            If you are attempting to sign-up, please use the following code to confirm your identity: \n\n
            ${verificationCode} \n\n
            Yours securely, \n\n
            Team Havur`,
      html: `Please verify that it's you<br/><br/>
            If you are attempting to sign-up, please use the following code to confirm your identity:<br/><br/>
            <b>${verificationCode}</b><br/><br/>
            Yours securely,<br/>
            Team Havur`,
    });
    if (!!response) {
      return true;
    }
  } catch (error: any) {
    return false;
  }
};

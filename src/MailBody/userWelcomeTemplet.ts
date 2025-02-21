export const createUserTemplate = (users: any) => {
  return `
<html>
<body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0;  color: #000; background:#fff">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff"
        style="margin: 0; padding: 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" bgcolor="#ffffff"
                    style=" overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td bgcolor="#000000" style="padding: 20px; display:flex; text-align: center; color: #ffffff; border-radius: 0px 0px 12px 12px;">
                            <img src="https://admin.trackroutepro.com/assets/TrPro-4a6ea475.png" alt="TrackRoutePro" width="175" height="33" style="display: block;">
                            <h1 style="margin-left: 100px; font-size: 18px; margin-top: 11; color: #ffffff;">Welcome to <span style="color: #D9E821;">Track Route Pro!</span></h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 18px; color: #000000; font-size: 16px; line-height: 24px;">
                        <p>Dear ${users.Name},</p>

                           ${
                             users?.subscribeType == "User"
                               ? `<p>Your id is ${users.emailAddress},</p>
               <p>and your password is ${users.password}.</p>`
                               : `<p>Your id is ${users.phone},</p>
               <p>and your password is ${users.password}.</p>`
                           }
                        
                            <p>Welcome to Track Route Pro! We are excited to have you on board.</p>
                            <p>Track Route Pro is designed to provide advanced features for:</p>
                            <ul style="padding-left: 18px; color: #000000;">
                                <li>Real-time tracking to monitor your routes effectively.</li>
                                <li>Enhanced security to safeguard your vehicles and journeys.</li>
                                <li>Route history tracking for easy review and analysis of past trips.</li>
                            </ul>
                            <p>Thank you for choosing Track Route Pro—With the Track Route Pro GPS tracker system,
                                everything that moves can be tracked and found.</p>
                            <p>If you didn't sign up for an account, please ignore this message.</p>
                            <p style="color: #949495; font-size: 14px;">Best regards,</p>
                            <p style="margin-top: -10px;">The TRP Team</p>
                        </td>
                    </tr>
                    <!-- Note -->
                    <tr>
                        <td style="color: #949495; font-size: 11px; padding: 10px;">
                            Note: This is a computer-generated email. Please do not reply to this message.
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px; display: flex;  background-color: #f4f4f4; font-size: 13px; color: #777; border-radius: 12px 12px 0px 0px;">
                            <div>
                                <p style="margin: 5px 0;"><a href="http://trpgps.com" target="_blank" style="color: #000000; text-decoration: none;">trpgps.com</a></p>
                                <p style="margin: 5px 0; ">&copy; 2025 Your Company. All rights reserved.</p>
                            </div>
                            <p style="margin: 10px 0; margin-left: 50px;">
                                Download Our App: <a href="https://example.com/app-ios" target="_blank" 
                                    style="color: #000000; text-decoration: none; ">iOS</a> |
                                <a href="https://example.com/app-android" target="_blank" 
                                  style="color: #000000; text-decoration: none;">Android</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

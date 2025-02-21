export const forgotPasswordTemplate = (users:any,otp:any) => {
    return `
     <html>
  <body
    style="
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
      color: #000;
      background: #fff;
    "
  >
    <table
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      bgcolor="#ffffff"
      style="margin: 0; padding: 0"
    >
      <tr>
        <td align="center">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="600"
            bgcolor="#ffffff"
            style="overflow: hidden"
          >
            <!-- Header -->
            <tr>
              <td
                bgcolor="#000000"
                style="
                  padding: 20px;
                  display: flex;
                  text-align: center;
                  color: #ffffff;
                  border-radius: 0px 0px 12px 12px;
                "
              >
                <img
                  src="https://admin.trackroutepro.com/assets/TrPro-4a6ea475.png"
                  alt="TrackRoutePro"
                  width="175"
                  height="33"
                  style="display: block"
                />
                <h1
                  style="
                    margin-left: 100px;
                    font-size: 18px;
                    margin-top: 11;
                    color: #ffffff;
                  "
                >
                Password Reset <span style="color: #d9e821; ">OTP</span>
                </h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td
                style="
                  padding: 18px;
                  color: #000000;
                  font-size: 16px;
                  line-height: 24px;
                "
              >
                <p>Dear ${users.Name},</p>
                <p>
                  We received a request to reset the password for your Track
                  Route Pro account. To proceed, please use the following
                  One-Time Password (OTP)
                </p>
                <p style="background-color: #000000; color: #d9e821; padding: 10px 25px 10px 25px ; display:inline-block; letter-spacing: 10px;">${otp}</p>
              
                <p>This OTP is valid for the next <span style="color: #000; font-weight: 600;">10 minutes</span> and can only be used once. 
                    For your security, do not share this OTP with anyone under any circumstances</p>
                <p>
                    Thank you for using Track Route Pro — With the Track Route Pro GPS tracker system, everything that moves can be tracked and found.
                </p>

                <p style="color: #949495; font-size: 14px">Best regards,</p>
                <p style="margin-top: -10px">The TRP Team</p>
              </td>
            </tr>
            <!-- Note -->
            <tr>
              <td style="color: #949495; font-size: 11px; padding: 10px">
                Note: This is a computer-generated email. Please do not reply to
                this message.
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td
                style="
                  padding: 20px;
                  display: flex;
                  background-color: #f4f4f4;
                  font-size: 13px;
                  color: #777;
                  border-radius: 12px 12px 0px 0px;
                "
              >
                <div>
                  <p style="margin: 5px 0">
                    <a
                      href="http://trpgps.com"
                      target="_blank"
                      style="color: #000000; text-decoration: none"
                      >trpgps.com</a
                    >
                  </p>
                  <p style="margin: 5px 0">
                    &copy; 2025 Your Company. All rights reserved.
                  </p>
                </div>
                <p style="margin: 10px 0; margin-left: 50px">
                  Download Our App:
                  <a
                    href="https://example.com/app-ios"
                    target="_blank"
                    style="color: #000000; text-decoration: none"
                    >iOS</a
                  >
                  |
                  <a
                    href="https://example.com/app-android"
                    target="_blank"
                    style="color: #000000; text-decoration: none"
                    >Android</a
                  >
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

export const AdminWelcomeTemplate = (users: any) => {
  console.log(users,"usersusersusersusers")
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
                  Welcome to <span style="color: #d9e821">TRP</span> as an
                  <span style="color: #d9e821">Admin</span>
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
                <p>Dear ${users.username},</p>
                <p>
                  Congratulations on becoming an admin with Track Route Pro!
                  Your account has been successfully created, and you can now
                  log in to start managing your operations
                </p>
                <p>Login Details.</p>
                <div style="width: 100%; display: flex">
                  <div style="width: 50%">
                    <p style="color: #000;
                    font-weight: 300;
                    font-family: cursive;">Login Id</p>
                    <span style="font-weight: 600;">${users.emailAddress}</span>
                  </div>
                  <div style="width: 50%">
                    <p style="color: #000;
                    font-weight: 300;
                    font-family: cursive;">Password</p>
                    <span style="font-weight: 600;">${users.password}</span>
                  </div>
                </div>
                <p>Login Link here</p>
                <p style="font-weight: 600;">Https://google.com</p>
                <p>
                  For your security, we recommend changing password as soon as
                  you log in. If you have any questions or need assistance, feel
                  free to reach out to us at
                  <span style="font-weight: 600;">hi@mrityunjaygautam.com</span>
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

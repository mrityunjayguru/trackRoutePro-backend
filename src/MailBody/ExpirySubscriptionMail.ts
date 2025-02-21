
export const ExpirySubscriptionMail = (records: any) => {
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
            Reminder for Subscription
            
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
             <p>Dear ${records.userDetails.Name},</p>
             <p>
              This is a friendly reminder that your vehicle registration <span style="color: #d9e821;font-weight: bold;">${records.vehicleNo}</span> will expire in the next 7 days. Please make sure to renew your subscription before the expiry date to avoid any interruptions.
             </p>
         <p>If you need assistance with the renewal process, feel free to contact us.

         </p>
             <p>Our team is actively working on resolving your issue, and we assure you that it will be addressed at the earliest. If we require any additional information, we will contact you promptly.</p>
             <p style="">In the meantime, if you have any updates or further details to add, feel free to reply to this email or contact our support team at support@trpgps.com.</p>
             <p>
               For your security, we recommend changing password as soon as
               you log in. If you have any questions or need assistance, feel
               free to reach out to us at
             </p>
             <p style="">Thank you for your patience and understanding. We’re here to help!</p>
             
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
  
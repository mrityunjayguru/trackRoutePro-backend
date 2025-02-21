import nodemailer from "nodemailer";

// Create transporter with Gmail SMTP settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use true for port 465, false for other ports
  auth: {
    user: "no-reply@creativedemonz.com", // Load email from environment variables
    pass: "urkirdskucwejvle", // Load password from environment variables
  },
});

// Function to send an email
export const sendEmail = async (payload:any) => {
  // console.log(payload,"payloadpayload")
  try {
    // Send email with dynamic content
    const info = await transporter.sendMail({
      from: "no-reply@trpgps.com", // Sender's email address
      to: payload.to, // Receiver's email address
      subject: payload.subject, // Email subject
      text: payload.text, // Plain text content
      html: payload.body, // HTML content
    });

    console.log('Message sent: %s', info);
    return info; // Return the message info if needed
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Propagate the error for handling in the caller
  }
};

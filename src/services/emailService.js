import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send a contact email to the administrator
 * @param {Object} details - { name, email, subject, message }
 */
export const sendContactEmail = async ({ name, email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'guptacodes7@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
  });

  const mailOptions = {
    from: `"${name} via IDEALAB" <${process.env.EMAIL_USER}>`,
    to: 'guptacodes7@gmail.com',
    replyTo: email,
    subject: `Contact Us: ${subject}`,
    html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Message</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; margin-top: 20px;">
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      <footer style="margin-top: 30px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 10px;">
        <p>This email was sent from the IDEALAB Contact Form.</p>
      </footer>
    </div>
  `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('Nodemailer Error:', error.message);
    return { success: false, error: error.message };
  }
};

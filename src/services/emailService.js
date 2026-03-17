import { BrevoClient } from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY || "" });

/**
 * Send a contact email to the administrator
 * @param {Object} details - { name, email, subject, message }
 */
export const sendContactEmail = async ({ name, email, subject, message }) => {
  const sendSmtpEmail = {
    subject: `Contact Us: ${subject}`,
    htmlContent: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Message</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; margin-top: 20px;">
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      <footer style="margin-top: 30px; font-size: 12px; color: #666; text-align: center; border-t: 1px solid #eee; pt-10;">
        <p>This email was sent from the IDEALAB Contact Form.</p>
      </footer>
    </div>
  `,
    sender: { name: `IDEALAB Contact: ${name}`, email: "akashgupta.gdscmmmut@gmail.com" },
    to: [{ email: "akashgupta7484@gmail.com", name: "IDEALAB Admin" }],
    replyTo: { email: email, name: name }
  };

  try {
    const data = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', data.body);
    return { success: true, data: data.body };
  } catch (error) {
    console.error('Brevo API Error:', error.message);
    
    if (error.response) {
      console.error('Error Response Body:', error.response.body);
    }
    return { success: false, error: error.response?.body?.message || error.message };
  }
};

import { sendContactEmail } from "../services/emailService.js";

/**
 * Handle Contact Us form submission
 */
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Simple validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Send email using Brevo service
    const emailResult = await sendContactEmail({ name, email, subject, message });

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: "Your message has been sent successfully!"
      });
    } else {
      // Pass the specific error message from the service to the frontend
      return res.status(500).json({
        success: false,
        message: emailResult.error || "Failed to send email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Contact Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "An internal server error occurred",
      error: error.message
    });
  }
};

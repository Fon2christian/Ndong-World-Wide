import * as nodemailer from "nodemailer";
import type { ContactAttrs } from "../models/Contact.js";

/**
 * Escape HTML special characters to prevent HTML injection
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Create reusable transporter
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email configuration missing. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email notification when a new contact inquiry is submitted
 */
export async function sendContactEmail(contact: ContactAttrs & { _id?: any; createdAt?: Date }): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error("Email service not configured");
  }

  const recipientEmail = process.env.CONTACT_NOTIFICATION_EMAIL || process.env.EMAIL_USER;

  // Escape all user-provided data to prevent HTML injection
  const escapedName = escapeHtml(contact.name);
  const escapedFurigana = escapeHtml(contact.furigana);
  const escapedEmail = escapeHtml(contact.email);
  const escapedPhone = escapeHtml(contact.phone);
  const escapedInquiryDetails = contact.inquiryDetails ? escapeHtml(contact.inquiryDetails) : '';

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Ndong World Wide'}" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `New Contact Inquiry from ${escapedName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          New Contact Inquiry
        </h2>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50;">Name:</strong><br/>
            <span style="color: #34495e;">${escapedName}</span>
          </p>

          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50;">Furigana:</strong><br/>
            <span style="color: #34495e;">${escapedFurigana}</span>
          </p>

          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50;">Email:</strong><br/>
            <a href="mailto:${escapedEmail}" style="color: #3498db;">${escapedEmail}</a>
          </p>

          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50;">Phone:</strong><br/>
            <a href="tel:${escapedPhone}" style="color: #3498db;">${escapedPhone}</a>
          </p>

          ${escapedInquiryDetails ? `
          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50;">Inquiry Details:</strong><br/>
            <span style="color: #34495e; white-space: pre-wrap;">${escapedInquiryDetails}</span>
          </p>
          ` : ''}

          <p style="margin: 10px 0; font-size: 12px; color: #7f8c8d;">
            <strong>Submitted:</strong> ${contact.createdAt ? new Date(contact.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }) : 'Just now'}
          </p>
        </div>

        <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Ndong World Wide contact form.
        </p>
      </div>
    `,
    text: `
New Contact Inquiry

Name: ${contact.name}
Furigana: ${contact.furigana}
Email: ${contact.email}
Phone: ${contact.phone}
${contact.inquiryDetails ? `\nInquiry Details:\n${contact.inquiryDetails}` : ''}

Submitted: ${contact.createdAt ? new Date(contact.createdAt).toLocaleString() : 'Just now'}
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

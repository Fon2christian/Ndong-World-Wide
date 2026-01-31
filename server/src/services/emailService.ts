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

/**
 * Sanitize email header values to prevent CRLF injection attacks
 * Removes or replaces CR (\r) and LF (\n) characters that could be used
 * to inject additional email headers
 */
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Sanitize the from name to prevent header injection
 * Removes CRLF, quotes, and limits length
 */
function sanitizeFromName(value: string | undefined, defaultValue: string): string {
  if (!value) return defaultValue;
  // Remove CRLF and quotes, trim, and limit length
  const sanitized = value
    .replace(/[\r\n"]+/g, '')
    .trim()
    .slice(0, 100);
  return sanitized || defaultValue;
}

/**
 * Sanitize plain text content for email body
 * Removes control characters (except newlines/tabs) and normalizes whitespace
 */
function sanitizePlainText(text: string): string {
  return text
    // Remove control characters except newline (\n), carriage return (\r), and tab (\t)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize line endings to \n
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Collapse multiple spaces (but not newlines) into single space
    .replace(/[^\S\n]+/g, ' ')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Collapse multiple blank lines into single blank line
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Create reusable transporter
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email configuration missing. Emails will not be sent.");
    return null;
  }

  // Parse and validate EMAIL_PORT
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const validPort = !isNaN(port) && port > 0 && port <= 65535 ? port : 587;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: validPort,
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

  // Sanitize header values to prevent CRLF injection
  const safeSubjectName = sanitizeHeader(contact.name);

  const fromName = sanitizeFromName(process.env.EMAIL_FROM_NAME, 'Ndong World Wide');

  const mailOptions = {
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `New Contact Inquiry from ${safeSubjectName}`,
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
            <a href="mailto:${encodeURIComponent(contact.email)}" style="color: #3498db;">${escapedEmail}</a>
          </p>

          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50;">Phone:</strong><br/>
            <a href="tel:${encodeURIComponent(contact.phone)}" style="color: #3498db;">${escapedPhone}</a>
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

Name: ${sanitizePlainText(contact.name)}
Furigana: ${sanitizePlainText(contact.furigana)}
Email: ${sanitizePlainText(contact.email)}
Phone: ${sanitizePlainText(contact.phone)}
${contact.inquiryDetails ? `\nInquiry Details:\n${sanitizePlainText(contact.inquiryDetails)}` : ''}

Submitted: ${contact.createdAt ? new Date(contact.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }) : 'Just now'}
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

import * as nodemailer from "nodemailer";
import type { ContactAttrs } from "../models/Contact.js";
import type { IAdmin } from "../models/Admin.js";

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

// Cached transporter instance
let transporter: nodemailer.Transporter | null = null;

// Create and cache reusable transporter
const getTransporter = () => {
  // Return cached transporter if it exists
  if (transporter) {
    return transporter;
  }

  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email configuration missing. Emails will not be sent.");
    return null;
  }

  // Parse and validate EMAIL_PORT
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const validPort = !isNaN(port) && port > 0 && port <= 65535 ? port : 587;

  // Create and cache the transporter
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: validPort,
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Send email notification when a new contact inquiry is submitted
 */
export async function sendContactEmail(contact: ContactAttrs & { _id?: any; createdAt?: Date }): Promise<void> {
  const emailTransporter = getTransporter();

  if (!emailTransporter) {
    throw new Error("Email service not configured");
  }

  // Support comma-separated email addresses for multiple recipients
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

  await emailTransporter.sendMail(mailOptions);
}

/**
 * Send password reset email to admin
 */
export async function sendPasswordResetEmail(admin: IAdmin, resetToken: string): Promise<void> {
  const emailTransporter = getTransporter();

  if (!emailTransporter) {
    throw new Error("Email service not configured");
  }

  // Get admin client URL from environment
  const adminClientUrl = process.env.ADMIN_CLIENT_URL || "http://localhost:5175/admin";
  const resetUrl = `${adminClientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  // Escape admin name to prevent HTML injection
  const escapedName = escapeHtml(admin.name);

  // Sanitize header values
  const safeSubjectName = sanitizeHeader(admin.name);
  const fromName = sanitizeFromName(process.env.EMAIL_FROM_NAME, "Ndong World Wide");

  const mailOptions = {
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to: admin.email,
    subject: `Password Reset Request - ${safeSubjectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Password Reset Request</h2>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hello ${escapedName},
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password for the Ndong World Wide admin dashboard.
        </p>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Click the button below to reset your password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #2563eb; color: white; padding: 14px 32px;
                    text-decoration: none; border-radius: 8px; display: inline-block;
                    font-size: 16px; font-weight: 600;">
            Reset Password
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${escapeHtml(resetUrl)}</a>
        </p>

        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 30px 0;">
          <p style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
            ⚠️ This link will expire in 1 hour.
          </p>
          <p style="color: #991b1b; font-size: 14px; margin: 0;">
            For security reasons, the reset link can only be used once.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 30px;">
          If you didn't request this password reset, please ignore this email.
          Your password will remain unchanged.
        </p>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          This is an automated email from Ndong World Wide Admin Portal.<br>
          Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
Password Reset Request

Hello ${sanitizePlainText(admin.name)},

We received a request to reset your password for the Ndong World Wide admin dashboard.

To reset your password, please visit the following link:
${resetUrl}

⚠️ IMPORTANT:
- This link will expire in 1 hour
- The link can only be used once
- For security, the link cannot be accessed after a successful password reset

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

---
This is an automated email from Ndong World Wide Admin Portal.
Please do not reply to this email.
    `.trim(),
  };

  await emailTransporter.sendMail(mailOptions);
}

/**
 * Send reply email to customer from admin
 */
export async function sendReplyEmail(params: {
  customerEmail: string;
  customerName: string;
  subject: string;
  message: string;
  adminName: string;
  replyId: string;
}): Promise<void> {
  const emailTransporter = getTransporter();

  if (!emailTransporter) {
    throw new Error("Email service not configured");
  }

  const { customerEmail, customerName, subject, message, adminName, replyId } = params;

  // Escape all user-provided data to prevent HTML injection
  const escapedCustomerName = escapeHtml(customerName);
  const escapedMessage = escapeHtml(message);
  const escapedAdminName = escapeHtml(adminName);

  // Sanitize header values to prevent CRLF injection
  const safeSubject = sanitizeHeader(subject);
  const fromName = sanitizeFromName(process.env.EMAIL_FROM_NAME, "Ndong World Wide");

  const mailOptions = {
    from: `"${fromName}" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: safeSubject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">Ndong World Wide</h2>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Dear ${escapedCustomerName},
        </p>

        <div style="color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap; margin: 20px 0;">
${escapedMessage}
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
            Best regards,<br>
            <strong>${escapedAdminName}</strong><br>
            Ndong World Wide
          </p>
        </div>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          This email was sent in response to your inquiry.<br>
          If you have any questions, please reply to this email.
        </p>
      </div>
    `,
    text: `
Dear ${sanitizePlainText(customerName)},

${sanitizePlainText(message)}

Best regards,
${sanitizePlainText(adminName)}
Ndong World Wide

---
This email was sent in response to your inquiry.
If you have any questions, please reply to this email.
    `.trim(),
  };

  try {
    await emailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send reply email (Reply ID: ${replyId}):`, error);
    throw error;
  }
}

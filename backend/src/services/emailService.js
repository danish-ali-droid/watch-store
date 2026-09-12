import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

/**
 * Email Service for ChronoLux
 * Production-ready email handling with proper error management
 */

// Validate environment variables on startup
const validateEmailConfig = () => {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing email configuration: ${missing.join(', ')}`);
    console.warn('   Email features will be disabled. Update your .env file.');
    return false;
  }
  return true;
};

const isEmailConfigValid = validateEmailConfig();

/**
 * Initialize Nodemailer transporter
 * For Gmail: Use port 587 with secure: false (STARTTLS)
 * Alternative: Use port 465 with secure: true (SMTPS)
 * 
 * If experiencing ENETUNREACH errors, try IPv4-only connection with tls.createSecureContext
 */
const createTransporter = () => {
  if (!isEmailConfigValid) {
    console.warn('⚠️  Email transporter disabled due to missing configuration');
    return null;
  }

  try {
    const smtpPort = parseInt(process.env.SMTP_PORT, 10);
    
    // For Gmail on port 587 with IPv4-only option for network issues
    const transporterConfig = {
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports like 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use App Password, NOT regular Gmail password
      },
      // Connection timeout and socket timeout for reliability
      connectionTimeout: 10000,
      socketTimeout: 10000,
      // Force IPv4 if experiencing ENETUNREACH errors
      family: 4, // Use IPv4 only (0 = both, 4 = IPv4 only, 6 = IPv6 only)
    };

    const transporter = nodemailer.createTransport(transporterConfig);

    console.log('✅ Email transporter initialized successfully (IPv4 mode)');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error.message);
    return null;
  }
};

const transporter = createTransporter();

/**
 * Send verification email with OTP
 * @param {string} recipientEmail - The recipient's email address
 * @param {string} otp - The one-time password
 * @param {string} purpose - Purpose of OTP (registration, passwordReset, orderVerification)
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendVerificationEmail = async (recipientEmail, otp, purpose = 'registration') => {
  if (!transporter) {
    return {
      success: false,
      message: 'Email service is not configured. Please check your .env file.',
    };
  }

  if (!recipientEmail || !otp) {
    return {
      success: false,
      message: 'Recipient email and OTP are required.',
    };
  }

  const emailSubjects = {
    registration: 'ChronoLux - Your Registration Verification Code',
    passwordReset: 'ChronoLux - Password Reset Verification Code',
    orderVerification: 'ChronoLux - Order Verification Code',
  };

  const emailBodies = {
    registration: `
Welcome to ChronoLux!

Your verification code for account registration is:
${otp}

This code will expire in 2 minutes. Do not share this code with anyone.

If you did not request this code, please ignore this email.

Best regards,
ChronoLux Support Team
    `,
    passwordReset: `
Password Reset Request

Your verification code to reset your password is:
${otp}

This code will expire in 2 minutes. Do not share this code with anyone.

If you did not request this password reset, please ignore this email.

Best regards,
ChronoLux Support Team
    `,
    orderVerification: `
Order Verification

Your verification code for placing an order is:
${otp}

This code will expire in 2 minutes. Do not share this code with anyone.

Best regards,
ChronoLux Support Team
    `,
  };

  const subject = emailSubjects[purpose] || emailSubjects.registration;
  const htmlBody = emailBodies[purpose] || emailBodies.registration;

  try {
    const info = await transporter.sendMail({
      from: `"ChronoLux Support" <${process.env.SMTP_USER}>`,
      to: recipientEmail.toLowerCase(), // Ensure recipient email is lowercase
      subject: subject,
      text: htmlBody,
      html: `<pre>${htmlBody}</pre>`,
    });

    console.log(`✅ Email sent successfully to ${recipientEmail} (Message ID: ${info.messageId})`);
    return {
      success: true,
      message: 'Verification email sent successfully',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`❌ Error sending email to ${recipientEmail}:`, error.message);
    
    // Detailed error logging for debugging
    if (error.code === 'EAUTH') {
      console.error('   ⚠️  Authentication Error: Check your SMTP credentials');
      console.error('   Tip: For Gmail, generate an App Password at: https://myaccount.google.com/apppasswords');
    }
    
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
      errorCode: error.code,
    };
  }
};

/**
 * Send purchase confirmation email
 * @param {string} recipientEmail - Customer's email
 * @param {Object} orderDetails - Order information
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendPurchaseConfirmationEmail = async (recipientEmail, orderDetails) => {
  if (!transporter) {
    return {
      success: false,
      message: 'Email service is not configured.',
    };
  }

  if (!recipientEmail || !orderDetails) {
    return {
      success: false,
      message: 'Recipient email and order details are required.',
    };
  }

  const { orderId, totalAmount, itemCount, shippingAddress, paymentMethod } = orderDetails;

  const htmlBody = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your purchase!</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Total Amount:</strong> Rs. ${totalAmount}</p>
    <p><strong>Items:</strong> ${itemCount}</p>
    <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    <p>Your order will be processed and shipped shortly.</p>
    <p>Best regards,<br>ChronoLux Support Team</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"ChronoLux Support" <${process.env.SMTP_USER}>`,
      to: recipientEmail.toLowerCase(),
      subject: 'ChronoLux - Order Confirmation',
      html: htmlBody,
    });

    console.log(`✅ Purchase confirmation email sent to ${recipientEmail}`);
    return {
      success: true,
      message: 'Purchase confirmation email sent',
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`❌ Error sending purchase confirmation to ${recipientEmail}:`, error.message);
    return {
      success: false,
      message: `Failed to send confirmation email: ${error.message}`,
    };
  }
};

/**
 * Verify Nodemailer transporter connection
 * Use this during app startup to verify email configuration
 */
export const verifyEmailConnection = async () => {
  if (!transporter) {
    console.warn('⚠️  Email transporter is not configured');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email transporter connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email transporter connection verification failed:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   Check your SMTP credentials in .env file');
      console.error('   For Gmail, use App Password: https://myaccount.google.com/apppasswords');
    }
    return false;
  }
};

export default {
  sendVerificationEmail,
  sendPurchaseConfirmationEmail,
  verifyEmailConnection,
};

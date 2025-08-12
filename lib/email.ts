// @/lib/email.ts - Updated with HTML content handling
import { Resend } from 'resend';
import { getEnvironmentVariable } from './utils';
import { EmailVerificationTemplate, NotifyTaskAssigned, PasswordResetSuccessTemplate, ResetPasswordEmailTemplate } from '@/components/EmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to strip HTML tags (server-side safe)
const stripHtmlTags = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Remove HTML tags using regex (server-safe approach)
  const stripped = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags completely
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // Remove style tags completely
    .replace(/<[^>]*>/g, '') // Remove all other HTML tags
    .replace(/&nbsp;/gi, ' ') // Replace &nbsp; with regular space
    .replace(/&amp;/gi, '&')  // Replace &amp; with &
    .replace(/&lt;/gi, '<')   // Replace &lt; with <
    .replace(/&gt;/gi, '>')   // Replace &gt; with >
    .replace(/&quot;/gi, '"') // Replace &quot; with "
    .replace(/&#39;/gi, "'")  // Replace &#39; with '
    .replace(/&#x27;/gi, "'") // Replace &#x27; with '
    .replace(/&hellip;/gi, '...') // Replace &hellip; with ...
    .replace(/\s+/g, ' ')     // Replace multiple whitespace with single space
    .trim();
  
  return stripped;
};

// Helper function to truncate text to a specific length
const truncateText = (text: string, maxLength: number = 300): string => {
  if (!text || text.length <= maxLength) return text;
  
  // Try to break at a word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

export async function sendVerificationEmail(email: string, code: string) {
  console.log(code)
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'no-reply@lunadrone.com',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, code: string) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'no-reply@lunadrone.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset. Please use the following code to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendConfirmationStartupEmail({email, token, name}:{email:string, token: string, name:string}) {
  const confirmationUrl = `${getEnvironmentVariable('APP_ORIGIN')}/email/verify?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: "LunaDrone <verification@lunadrone.com>",
    to: [email],
    subject: "Confirm your Email",
    react: EmailVerificationTemplate({  confirmationUrl, username: name, }),
    headers: {
      'List-Unsubscribe': `<${confirmationUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
  });

  if (error) throw error;
  return data;
}

// Updated function to handle HTML content properly
export async function NOtifyAdminuser({
  email, 
  name: sender, 
  username, 
  title, 
  description
}: {
  email: string;
  username: string;
  name: string;
  title: string;
  description: string;
}) {
  // Process the description to handle HTML content
  const plainDescription = stripHtmlTags(description);
  const truncatedDescription = truncateText(plainDescription, 250);
  
  // Log for debugging
  console.log('Original description:', description);
  console.log('Plain description:', plainDescription);
  console.log('Truncated description:', truncatedDescription);

  try {
    const { data, error } = await resend.emails.send({
      from: "LunaDrone <newtasks@lunadrone.com>",
      to: [email],
      subject: "New Task Assigned - Luna",
      react: NotifyTaskAssigned({  
        description: truncatedDescription, // Use plain text version
        sender, 
        title, 
        username 
      }),
      headers: {
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    });

    if (error) {
      console.error('Email sending error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send task notification email:', error);
    throw error;
  }
}

// Updated function for multiple users
export async function notifyMultipleUsers(notifications: Array<{
  email: string;
  username: string; 
  title: string;
  description: string;
  sender: string;
}>) {
  if (!notifications || notifications.length === 0) {
    return { successful: 0, failed: 0 };
  }

  let successful = 0;
  let failed = 0;

  for (const notification of notifications) {
    try {
      // Process HTML content for each notification
      const plainDescription = stripHtmlTags(notification.description);
      const truncatedDescription = truncateText(plainDescription, 250);

      await NOtifyAdminuser({
        email: notification.email,
        username: notification.username,
        name: notification.sender,
        title: notification.title,
        description: truncatedDescription // Use processed description
      });
      
      successful++;
      console.log(`Email sent successfully to ${notification.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${notification.email}:`, error);
      failed++;
    }
    
    // Add delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return { successful, failed };
}


// Utility function to validate if content contains HTML
export function containsHtml(content: string): boolean {
  if (!content) return false;
  
  // Check for common HTML tags
  const htmlTagRegex = /<[^>]*>/;
  return htmlTagRegex.test(content);
}


// Utility function to get content preview for emails
export function getEmailContentPreview(htmlContent: string, maxLength: number = 200): string {
  const plainText = stripHtmlTags(htmlContent);
  return truncateText(plainText, maxLength);
}


// 
export async function SendPWDResetEmail({token, email, name}:{token:string, email:string, name:string}){
  const confirmationUrl = `${getEnvironmentVariable('APP_ORIGIN')}/auth/reset-password?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: "LunaDrone <reset-password@lunadrone.com>",
    to: [email],
    subject: "Reset Your password",
    react: ResetPasswordEmailTemplate({  resetUrl:confirmationUrl, username: name, }),
    headers: {
      'List-Unsubscribe': `<${confirmationUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
  });

  if (error) throw error;
  return data;
}


export async function sendPasswordChangedEmail({ email, name}:{ email:string, name:string}){

  const { data, error } = await resend.emails.send({
    from: "LunaDrone <reset-password@lunadrone.com>",
    to: [email],
    subject: "Password Changed Successfully",
    react: PasswordResetSuccessTemplate({   username: name, }),
    headers: {
      
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
  });

  if (error) throw error;
  return data;
}

// Export utility functions for use in other parts of the application
export { stripHtmlTags, truncateText };
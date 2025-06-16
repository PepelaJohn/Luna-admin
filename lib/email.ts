

// @/lib/email.ts
import { Resend } from 'resend';
import { getEnvironmentVariable } from './utils';
import { EmailVerificationTemplate, NotifyTaskAssigned } from '@/components/EmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
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


export async function NOtifyAdminuser({email, name:sender, username, title, description}:{email:string, username:string, name:string, title:string, description:string}){
  const { data, error } = await resend.emails.send({
    from: "LunaDrone <newtasks@lunadrone.com>",
    to: [email],
    subject: "New Task Assigned - Luna",
    react: NotifyTaskAssigned({  description, sender, title, username }),
    headers: {
     
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
  });

  if (error)  return;
  return data;
}






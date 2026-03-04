import { Resend } from "resend";
import { ENV } from "./env";

const resend = new Resend(ENV.resendApiKey);

export async function sendVerificationEmail(email: string, code: string) {
    if (!ENV.resendApiKey) {
        console.log(`[EMAIL BYPASS] Verification code for ${email} is ${code}`);
        return;
    }

    try {
        // In free tier of Resend, you can only send emails from onboarding@resend.dev to the registered email address.
        // For a real domain, you'd verify it in Resend and use "noreply@bishouy.com".
        await resend.emails.send({
            from: "Bishouy.com <onboarding@resend.dev>",
            to: email,
            subject: "Your Verification Code - Bishouy.com",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F0F0E; padding: 40px; border-radius: 8px; color: #F2F0EB;">
          <h1 style="color: #E8A020; text-align: center; font-size: 24px;">Welcome to BISHOUY.COM</h1>
          <p style="font-size: 16px; margin-top: 30px;">Here is your verification code. It is valid for 30 minutes.</p>
          <div style="background-color: #1C1C1A; padding: 20px; text-align: center; border-radius: 4px; margin: 30px 0; border: 1px solid #E8A020;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #E8A020;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #8A8880;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
        });
        console.log(`[EMAIL SENT] Verification code sent to ${email}`);
    } catch (error) {
        console.error("[EMAIL ERROR] Failed to send verification email:", error);
    }
}

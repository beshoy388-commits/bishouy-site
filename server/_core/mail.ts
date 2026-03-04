import { ENV } from "./env";

async function sendBrevoEmail({ to, subject, htmlContent }: { to: string | string[], subject: string, htmlContent: string }) {
  if (!ENV.brevoApiKey) {
    console.log(`[EMAIL BYPASS] Brevo API Key missing. Subject: ${subject}`);
    return;
  }

  const recipients = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }];

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": ENV.brevoApiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Bishouy.com", email: "onboarding@brevo.dev" },
        to: recipients,
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
    }

    console.log(`[EMAIL SENT] via Brevo to ${Array.isArray(to) ? to.length + " recipients" : to}`);
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send email via Brevo:", error);
  }
}

export async function sendVerificationEmail(email: string, code: string) {
  await sendBrevoEmail({
    to: email,
    subject: "Your Verification Code - Bishouy.com",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F0F0E; padding: 40px; border-radius: 8px; color: #F2F0EB;">
        <h1 style="color: #E8A020; text-align: center; font-size: 24px;">Welcome to BISHOUY.COM</h1>
        <p style="font-size: 16px; margin-top: 30px;">Here is your verification code. It is valid for 30 minutes.</p>
        <div style="background-color: #1C1C1A; padding: 20px; text-align: center; border-radius: 4px; margin: 30px 0; border: 1px solid #E8A020;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #E8A020;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #8A8880;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  await sendBrevoEmail({
    to: email,
    subject: "Reset Your Password - Bishouy.com",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F0F0E; padding: 40px; border-radius: 8px; color: #F2F0EB;">
        <h1 style="color: #E8A020; text-align: center; font-size: 24px;">Reset Your Password</h1>
        <p style="font-size: 16px; margin-top: 30px;">We received a request to reset your password for your Bishouy.com account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #E8A020; color: #0F0F0E; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #8A8880;">This link is valid for 30 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `
  });
}

export async function sendNewsletterBroadcast(subject: string, htmlContent: string, recipients: string[]) {
  for (const email of recipients) {
    await sendBrevoEmail({
      to: email,
      subject: subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F0F0E; padding: 40px; border-radius: 8px; color: #F2F0EB; margin-bottom: 30px;">
          ${htmlContent}
        </div>
        <p style="font-size: 11px; color: #555550; text-align: center;">You are receiving this email because you subscribed to Bishouy.com. <br>To unsubscribe, go to your profile settings.</p>
      `
    });
  }
}

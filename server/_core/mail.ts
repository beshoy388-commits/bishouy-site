import { ENV } from "./env";

async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
}: {
  to: string | string[];
  subject: string;
  htmlContent: string;
}) {
  if (!ENV.brevoApiKey) {
    console.log(`[EMAIL BYPASS] Brevo API Key missing. Subject: ${subject}`);
    return;
  }

  // Verified sender on Brevo — bishouy.com domain authenticated
  const senderEmail = "no-reply@bishouy.com";
  const recipients = Array.isArray(to)
    ? to.map(email => ({ email }))
    : [{ email: to }];

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": ENV.brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Bishouy.com", email: senderEmail },
        to: recipients,
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Brevo API error: ${JSON.stringify(result)}`);
    }

    console.log(
      `[EMAIL SENT] via Brevo to ${Array.isArray(to) ? to.length + " recipients" : to}. MessageID: ${result.messageId}`
    );
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
    `,
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
    `,
  });
}

export async function sendNewsletterBroadcast(
  subject: string,
  htmlContent: string,
  recipients: { email: string; token: string }[]
) {
  const baseUrl = ENV.appUrl.replace(/\/$/, "");
  for (const { email, token } of recipients) {
    const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${token}`;
    await sendBrevoEmail({
      to: email,
      subject: subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F0F0E; padding: 24px; border-radius: 8px; color: #F2F0EB; margin-bottom: 30px; box-sizing: border-box;">
          ${htmlContent}
        </div>
        <p style="font-size: 11px; color: #555550; text-align: center; margin-top: 16px;">
          You are receiving this email because you subscribed to Bishouy.com.<br/>
          <a href="${unsubscribeUrl}" style="color: #8A8880;">Unsubscribe</a> &nbsp;·&nbsp;
          <a href="${baseUrl}/privacy-policy" style="color: #8A8880;">Privacy Policy</a>
        </p>
      `,
    });
  }
}

export async function sendWelcomeNewsletterEmail(
  email: string,
  unsubscribeToken: string
) {
  const baseUrl = ENV.appUrl.replace(/\/$/, "");
  const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`;

  await sendBrevoEmail({
    to: email,
    subject: "Welcome to Bishouy.com — You're in! 🎙️",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#0A0A09; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A09; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#0F0F0E; border-radius:8px; overflow:hidden; border: 1px solid #1C1C1A;">

          <!-- Accent line -->
          <tr>
            <td style="background-color:#E8A020; height:3px;"></td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 48px 40px 32px;">
              <h1 style="margin:0 0 8px; font-size:32px; font-weight:900; color:#F2F0EB; line-height:1.2;">
                Welcome to<br/><span style="color:#E8A020;">Bishouy.</span>
              </h1>
              <p style="margin:0 0 4px; font-size:13px; color:#8A8880; letter-spacing:2px; text-transform:uppercase; font-weight:600;">
                The news, straight to your inbox.
              </p>

              <hr style="border:none; border-top:1px solid #1C1C1A; margin: 28px 0;"/>

              <p style="margin:0 0 20px; font-size:16px; color:#D4D0C8; line-height:1.7;">
                Thank you for subscribing. You're now part of our editorial community and will be among the <strong style="color:#F2F0EB;">first to know</strong> when we publish new articles, breaking news, and exclusive in-depth analysis.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color:#E8A020; border-radius:4px;">
                    <a href="${baseUrl}" style="display:inline-block; padding: 14px 32px; color:#0F0F0E; text-decoration:none; font-size:13px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">
                      Read Today's News →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What you'll receive -->
              <p style="margin: 32px 0 12px; font-size:11px; font-weight:700; color:#E8A020; letter-spacing:3px; text-transform:uppercase;">What you'll receive</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #1C1C1A;">
                    <span style="color:#E8A020; margin-right:10px;">●</span>
                    <span style="color:#D4D0C8; font-size:14px;">Breaking news alerts as they happen</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #1C1C1A;">
                    <span style="color:#E8A020; margin-right:10px;">●</span>
                    <span style="color:#D4D0C8; font-size:14px;">Daily editorial briefing every morning</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-top: 1px solid #1C1C1A; border-bottom: 1px solid #1C1C1A;">
                    <span style="color:#E8A020; margin-right:10px;">●</span>
                    <span style="color:#D4D0C8; font-size:14px;">Exclusive in-depth analysis and opinion</span>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; font-size:14px; color:#8A8880; line-height:1.6;">
                — <strong style="color:#F2F0EB;">The Bishouy Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#070707; padding: 20px 40px; border-top: 1px solid #1C1C1A; text-align:center;">
              <p style="margin:0; font-size:11px; color:#555550; line-height:1.8;">
                You are receiving this because you subscribed at <a href="${baseUrl}" style="color:#8A8880;">bishouy.com</a><br/>
                <a href="${unsubscribeUrl}" style="color:#8A8880;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="${baseUrl}/privacy-policy" style="color:#8A8880;">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="${baseUrl}/terms-of-service" style="color:#8A8880;">Terms</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  });
}

export async function sendWelcomeEmailWithBenefits(email: string, name: string) {
  const baseUrl = ENV.appUrl.replace(/\/$/, "");

  await sendBrevoEmail({
    to: email,
    subject: `Benvenuto nell'Inner Circle, ${name} — La tua esperienza Bishouy inizia ora`,
    htmlContent: `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benvenuto su Bishouy.com</title>
</head>
<body style="margin:0; padding:0; background-color:#0A0A09; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #D4D0C8;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A09; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#0F0F0E; border-radius:12px; overflow:hidden; border: 1px solid #1C1C1A; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                    
                    <tr>
                        <td style="padding: 0;">
                            <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop" alt="The Art of Journalism" style="width:100%; height:auto; display:block; border-bottom: 2px solid #E8A020;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 48px 40px 32px;">
                            <h1 style="margin:0 0 16px; font-size:36px; font-weight:900; color:#F2F0EB; line-height:1.1;">
                                Welcome,<br/><span style="color:#E8A020;">${name}.</span>
                            </h1>
                            <p style="margin:0 0 24px; font-size:18px; color:#D4D0C8; line-height:1.6;">
                                We are honored to have you with us. Bishouy.com is not just a news outlet; it is your new compass in the unfiltered landscape of global intelligence.
                            </p>

                            <div style="background-color:#141412; border-left:4px solid #E8A020; padding: 20px; margin: 32px 0;">
                                <p style="margin:0; font-size:15px; color:#F2F0EB; font-style:italic; line-height:1.6;">
                                    "Our mission is to provide you with the analytical depth you deserve, with the velocity you require."
                                </p>
                            </div>

                            <h2 style="font-size:20px; color:#F2F0EB; margin: 40px 0 20px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">Exclusive Benefits</h2>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td valign="top" style="padding-bottom: 24px;">
                                        <table width="100%">
                                            <tr>
                                                <td width="50" valign="top">
                                                    <div style="width:36px; height:36px; background-color:#E8A020; border-radius:50%; text-align:center; line-height:36px; color:#0F0F0E; font-weight:bold;">1</div>
                                                </td>
                                                <td>
                                                    <p style="margin:0 0 4px; color:#F2F0EB; font-weight:700; font-size:16px;">Accesso Illimitato</p>
                                                    <p style="margin:0; font-size:14px; color:#8A8880;">Immergiti senza limiti nelle nostre inchieste esclusive e nei dossier geopolitici.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding-bottom: 24px;">
                                        <table width="100%">
                                            <tr>
                                                <td width="50" valign="top">
                                                    <div style="width:36px; height:36px; background-color:#E8A020; border-radius:50%; text-align:center; line-height:36px; color:#0F0F0E; font-weight:bold;">2</div>
                                                </td>
                                                <td>
                                                    <p style="margin:0 0 4px; color:#F2F0EB; font-weight:700; font-size:16px;">Editorial AI Assistant</p>
                                                    <p style="margin:0; font-size:14px; color:#8A8880;">Leverage our highly accurate AI models to synthesize events or generate custom analytical projections.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding-bottom: 24px;">
                                        <table width="100%">
                                            <tr>
                                                <td width="50" valign="top">
                                                    <div style="width:36px; height:36px; background-color:#E8A020; border-radius:50%; text-align:center; line-height:36px; color:#0F0F0E; font-weight:bold;">3</div>
                                                </td>
                                                <td>
                                                    <p style="margin:0 0 4px; color:#F2F0EB; font-weight:700; font-size:16px;">Personal Intelligence library</p>
                                                    <p style="margin:0; font-size:14px; color:#8A8880;">Curate your own database of saved articles and cross-reference research across all your devices.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 48px 0 24px;">
                                <tr>
                                    <td align="center" style="background-color:#E8A020; border-radius:6px; padding: 18px;">
                                        <a href="${baseUrl}" style="color:#0F0F0E; text-decoration:none; font-size:16px; font-weight:800; text-transform:uppercase; letter-spacing:2px; display:block;">
                                            Begin Your Journey →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 40px 0 0; font-size:15px; color:#8A8880; line-height:1.6; text-align:center;">
                                We'll see you on the other side of information.<br/>
                                — <strong style="color:#F2F0EB;">The Bishouy Editorial Board</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color:#070707; padding: 32px 40px; border-top: 1px solid #1C1C1A; text-align:center;">
                            <p style="margin:0; font-size:11px; color:#444440; line-height:1.8; text-transform:uppercase; letter-spacing:1px;">
                                &copy; 2026 BISHOUY EDITORIAL GROUP. ALL RIGHTS RESERVED.<br/>
                                <a href="${baseUrl}/privacy-policy" style="color:#666660; text-decoration:none; border-bottom: 1px solid #222;">Privacy Policy</a> &nbsp;·&nbsp; 
                                <a href="${baseUrl}/contact" style="color:#666660; text-decoration:none; border-bottom: 1px solid #222;">Contact Us</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
  });
}

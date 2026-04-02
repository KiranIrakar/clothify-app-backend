import dotenv from "dotenv";
dotenv.config();

export async function sendEmail(to: string, otp: string) {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY missing");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          email: process.env.EMAIL_FROM,
          name: "Clothify 👕",
        },
        to: [{ email: to }],
        subject: "OTP",
        htmlContent: `
          <p>Hello there,</p>
          <p>Welcome to Meeting Platform. Please verify your email address to activate your account.</p>

          <div style="background:#e9f2ff;border:1px solid #b6d4ff;border-radius:8px;padding:12px;margin:14px 0;">
            <p style="margin:0 0 8px 0;"><strong>Email Verification</strong></p>
            <p style="margin:0;">This OTP is valid for <strong>30 seconds</strong>.</p>
          </div>

          <div style="background:#f6f8fb;border:1px dashed #9bb6ff;border-radius:10px;padding:18px;margin:18px 0;text-align:center;">
            <p style="margin:0 0 8px 0;color:#5b6b83;font-size:12px;letter-spacing:1px;">YOUR OTP CODE</p>
            <p style="margin:0;font-size:30px;font-weight:700;letter-spacing:6px;color:#1a73e8;">${otp}</p>
          </div>

          <p>If you did not create this account, you can ignore this email.</p>
        `,
      }),
    });

    const data = await response.json();

    console.log("BREVO RESPONSE:", data);

    if (!response.ok) {
      console.error("Brevo error:", data);
      throw new Error("Email failed");
    }

    console.log("Email sent:", data);
    return data;

  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}
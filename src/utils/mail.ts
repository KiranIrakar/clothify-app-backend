import dotenv from "dotenv";
dotenv.config();

import Brevo from "@getbrevo/brevo";

export async function sendEmail(to: string, otp: string) {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY missing");
    }

    const apiInstance = new Brevo.TransactionalEmailsApi();

    // ✅ Set API key
    apiInstance.setApiKey("api-key", process.env.BREVO_API_KEY);

    const response = await apiInstance.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM!,
        name: "Clothify 👕",
      },
      to: [{ email: to }],
      subject: "Clothify OTP Verification",

      // ✨ Updated Template
      htmlContent: `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
          
          <div style="max-width:400px; margin:auto; background:#ffffff; padding:25px; border-radius:8px; text-align:center;">
            
            <h2 style="color:#4f46e5; margin-bottom:10px;">Clothify 👕</h2>
            
            <p style="color:#333; font-size:16px;">
              Your OTP for login is:
            </p>

            <div style="
              margin:20px 0;
              font-size:26px;
              font-weight:bold;
              letter-spacing:5px;
              color:#ffffff;
              background:#4f46e5;
              padding:10px 20px;
              border-radius:6px;
              display:inline-block;
            ">
              ${otp}
            </div>

            <p style="font-size:13px; color:#666;">
              This OTP is valid for <b>5 minutes</b>.
            </p>

            <p style="font-size:12px; color:#999; margin-top:20px;">
              Do not share this code with anyone.
            </p>

          </div>

          <p style="text-align:center; font-size:12px; color:#aaa; margin-top:15px;">
            © ${new Date().getFullYear()} Clothify
          </p>

        </div>
      `,
    });

    console.log("Email sent:", response);
    return response;

  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}
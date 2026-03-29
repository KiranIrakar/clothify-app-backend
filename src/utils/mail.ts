import nodemailer from "nodemailer";

export async function sendEmail(to: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: "Clothify 👕",
    to,
    subject: "Your Clothify OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
        <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center;">
          
          <h2 style="color:#333;">Clothify Verification</h2>
           
          <p style="font-size:16px; color:#555;">
            Use the OTP below to verify your account
          </p>

          <div style="margin:20px 0;">
            <span style="
              display:inline-block;
              font-size:28px;
              letter-spacing:8px;
              font-weight:bold;
              color:#fff;
              background:#4CAF50;
              padding:10px 20px;
              border-radius:8px;
            ">
              ${otp}
            </span>
          </div>

          <p style="color:#777; font-size:14px;">
            This OTP is valid for <b>5 minutes</b>.
          </p>

          <p style="color:#999; font-size:12px; margin-top:20px;">
            If you didn’t request this, please ignore this email.
          </p>

        </div>
      </div>
    `
  });
}
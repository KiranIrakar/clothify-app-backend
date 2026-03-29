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
    from: `"Clothify 👕" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Clothify OTP Verification",
    html: `
      <div style="background:#f9fafc; padding:40px 0; font-family: Arial, sans-serif;">
        
        <div style="max-width:420px; margin:auto; background:#ffffff; border-radius:10px; padding:30px; text-align:center;">
          
          <!-- Logo / Brand -->
          <h1 style="margin:0; color:#4f46e5;">Clothify 👕</h1>
          
          <!-- Heading -->
          <h3 style="margin-top:15px; color:#222;">Verify your login</h3>

          <!-- Message -->
          <p style="font-size:14px; color:#555;">
            Use the code below to securely sign in to your account.
          </p>

          <!-- OTP Button Style -->
          <div style="margin:25px 0;">
            <div style="
              display:inline-block;
              background:#4f46e5;
              color:#ffffff;
              font-size:24px;
              font-weight:bold;
              letter-spacing:6px;
              padding:12px 26px;
              border-radius:6px;
            ">
              ${otp}
            </div>
          </div>

          <!-- Expiry -->
          <p style="font-size:13px; color:#777;">
            Valid for <b>5 minutes</b> only
          </p>

          <!-- Security -->
          <p style="font-size:12px; color:#999; margin-top:20px;">
            For security reasons, never share your OTP.
          </p>

        </div>

        <!-- Footer -->
        <div style="text-align:center; margin-top:15px; font-size:12px; color:#aaa;">
          © ${new Date().getFullYear()} Clothify
        </div>

      </div>
    `
  });
}
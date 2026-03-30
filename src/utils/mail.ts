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
        htmlContent: `<h1>${otp}</h1>`,
      }),
    });

    const data = await response.json();

    console.log("BREVO RESPONSE:", data); // 👈 ADD THIS


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
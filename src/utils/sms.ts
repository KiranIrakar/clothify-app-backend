import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(phone: string, otp: string) {
  try {
    await client.messages.create({
      body: `CLOTHIFY: Your OTP is ${otp}. Do not share it with anyone.`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });

    console.log("✅ SMS sent");
  } catch (error) {
    console.error("❌ SMS failed", error);
  }
}
import twilio from "twilio";
import { logger } from "./logger";

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE;

if (!accountSid || !authToken || !fromPhone) {
  throw new Error("Twilio configuration is missing. Set TWILIO_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE.");
}

const client = twilio(accountSid, authToken);

function normalizePhone(phone: string): string {
  const normalized = phone.trim();
  if (!normalized) {
    throw new Error("A valid phone number is required.");
  }

  const digits = normalized.replace(/[^0-9+]/g, "");
  if (!digits.startsWith("+")) {
    throw new Error("Phone number must be in E.164 format with country code, e.g. +919999999999.");
  }

  return digits;
}

export async function sendSMS(phone: string, otp: string) {
  const to = normalizePhone(phone);
  try {
    const message = await client.messages.create({
      body: `CLOTHIFY: Your OTP is ${otp}. Do not share it with anyone.`,
      from: fromPhone,
      to,
    });

    logger.info("SMS sent", { sid: message.sid, to });
    return message;
  } catch (error) {
    logger.error("SMS failed", error);
    throw error;
  }
}

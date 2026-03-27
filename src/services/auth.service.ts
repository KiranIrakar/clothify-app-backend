import { generateOTP } from "../utils/otp";
import { sendEmail } from "../utils/mail";
import { sendSMS } from "../utils/sms";
import { generateToken } from "../utils/jwt";
import User from "../models/user.model";
import bcrypt from "bcrypt";

export class AuthService {

  async signup(data: any) {
    const { email, name, password, phone } = data;

    if (!email || !password || !name) {
      throw new Error("Email, Name and Password are required");
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      phone,
      otp,
      otp_expiry: expiry
    });

    await sendEmail(email, otp);

    if (phone) {
      await sendSMS(phone, otp);
    }

    const token = generateToken({
      id: user.getDataValue("id"),
      email: user.getDataValue("email")
    });

    return {
      message: `User registered successfully. OTP sent to ${email}`,
      token,
      user: {
        id: user.getDataValue("id"),
        email: user.getDataValue("email"),
        name: user.getDataValue("name")
      }
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new Error("User not found");

    if (user.getDataValue("otp") !== otp) {
      throw new Error("Invalid OTP");
    }

    if (Date.now() > user.getDataValue("otp_expiry")) {
      throw new Error("OTP expired");
    }

    await user.update({
      otp: null,
      otp_expiry: null
    });

    const token = generateToken({
      id: user.getDataValue("id"),
      email: user.getDataValue("email")
    });

    return {
      message: "Login successful",
      token,
      user: {
        id: user.getDataValue("id"),
        email: user.getDataValue("email"),
        name: user.getDataValue("name")
      }
    };
  }

  async resendOtp(email: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    await user.update({
      otp,
      otp_expiry: expiry
    });

    await sendEmail(email, otp);

    return {
      message: `OTP resent successfully to ${email}`
    };
  }

  async resetPassword(data: any) {
    const { email, newPassword } = data;

    if (!email || !newPassword) {
      throw new Error("Email and new password required");
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword
    });

    return {
      message: "Password reset successful"
    };
  }
}
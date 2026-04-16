import { generateOTP } from "../utils/otp";
import { sendEmail } from "../utils/mail";
import { sendSMS } from "../utils/sms";
import { generateToken } from "../utils/jwt";
import { validateIndianPhone } from "../utils/phone";
import User from "../models/user.model";
import bcrypt from "bcrypt";
// import { whatsappClient } from "../utils/whatsapp";
import { logger } from "../utils/logger";

export class AuthService {

  async signup(data: any) {
    const { email, name, password, phone } = data;

    if (!email || !password || !name) {
      throw new Error("Email, Name and Password are required");
    }

    if (phone) {
      validateIndianPhone(phone);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      phone
    });



    return {
      message: `User registered successfully`,
      user: {
        id: user.getDataValue("id"),
        email: user.getDataValue("email"),
        name: user.getDataValue("name")
      }
    };
  }

  async verifyOtp(data: { email?: string; phone?: string; otp: string }) {
    const { email, phone, otp } = data;

    if (!otp) {
      throw new Error("OTP is required");
    }

    if (!email && !phone) {
      throw new Error("Email or phone is required to verify OTP");
    }

    if (phone) {
      validateIndianPhone(phone);
    }

    let user = null;
    if (email) {
      user = await User.findOne({ where: { email } });
    }
    if (!user && phone) {
      user = await User.findOne({ where: { phone } });
    }

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

  async resendOtp(data: { email?: string; phone?: string }) {
    const { email, phone } = data;

    if (!email && !phone) {
      throw new Error("Email or phone is required to resend OTP");
    }

    if (phone) {
      validateIndianPhone(phone);
    }

    let user = null;
    if (email) {
      user = await User.findOne({ where: { email } });
    }
    if (!user && phone) {
      user = await User.findOne({ where: { phone } });
    }

    if (!user) {
      throw new Error("User not found");
    }

    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    await user.update({
      otp,
      otp_expiry: expiry
    });

    const finalEmail = user.getDataValue("email");
    const finalPhone = user.getDataValue("phone");
    let sent = false;
    const errors: string[] = [];

    if (finalEmail) {
      try {
        await sendEmail(finalEmail, otp, user.getDataValue("name"));
        sent = true;
      } catch (err: any) {
        logger.error("Email failed", err);
        errors.push(`Email delivery failed: ${err?.message || "Unknown error"}`);
      }
    }

    if (finalPhone) {
      try {
        await sendSMS(finalPhone, otp);
        sent = true;
      } catch (err: any) {
        logger.error("SMS failed", err);
        errors.push(`SMS delivery failed: ${err?.message || "Unknown error"}`);
      }

      // try {
      //   await whatsappClient.sendWhatsApp(finalPhone, "Test message");
      // } catch (err: any) {
      //   logger.error("WhatsApp failed", err);
      // }
    }

    if (!sent) {
      throw new Error(`OTP resend failed: ${errors.join("; ")}`);
    }

    return {
      message: `OTP resent successfully${finalEmail && finalPhone ? " via email and SMS" : finalEmail ? " to email" : " to phone"}`
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


  async generateOtp(data: any) {
    const { email, phone } = data;

    if (!email && !phone) {
      throw new Error("Email or phone required");
    }

    if (phone) {
      validateIndianPhone(phone);
    }

    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    try {
      let user;

      // Search for existing user
      if (email) {
        user = await User.findOne({ where: { email } });
      }
      if (!user && phone) {
        user = await User.findOne({ where: { phone } });
      }

      if (user) {
        // Update existing user
        await user.update({
          otp,
          otp_expiry: expiry,
          email: email || user.getDataValue("email"),
          phone: phone || user.getDataValue("phone")
        });
      } else {
        // Create new user
        user = await User.create({
          email: email || null,
          phone: phone || null,
          otp,
          otp_expiry: expiry
        });
      }

      const finalPhone = phone || user.getDataValue("phone");
      const finalEmail = email || user.getDataValue("email");
      let sent = false;
      const errors = [];

      // Try sending email if provided or exists
      if (finalEmail) {
        try {
          await sendEmail(finalEmail, otp, user.getDataValue("name") || "User");
          logger.info("Email sent successfully", { email: finalEmail });
          sent = true;
        } catch (err: any) {
          logger.error("Email failed", err);
          errors.push(`Email delivery failed: ${err?.message || "Unknown error"}`);
        }
      }

      // Try sending SMS if phone provided or exists
      if (finalPhone) {
        try {
          await sendSMS(finalPhone, otp);
          logger.info("SMS sent successfully", { phone: finalPhone });
          sent = true;
        } catch (err: any) {
          logger.error("SMS failed", err);
          errors.push(`SMS delivery failed: ${err?.message || "Unknown error"}`);
        }
      }

      // Try sending WhatsApp if phone provided or exists
      if (finalPhone) {
        // try {
        //   await whatsappClient.sendWhatsApp(
        //     finalPhone,
        //     `Your OTP is ${otp}`
        //   );
        //   logger.info("WhatsApp sent successfully", { phone: finalPhone });
        //   sent = true;
        // } catch (err: any) {
        //   logger.error("WhatsApp failed", err);
        //   errors.push(`WhatsApp delivery failed: ${err?.message || "Unknown error"}`);
        // }
      }

      if (!sent) {
        throw new Error(`OTP failed to send via all channels: ${errors.join("; ")}`);
      }

      return {
        message: "OTP generated and sent successfully",
        sentVia: finalEmail && finalPhone ? "email and SMS" : finalEmail ? "email" : "SMS",
        userId: user.getDataValue("id")
      };
    } catch (err: any) {
      console.error("🔥 generateOtp error:", err);
      throw err;
    }
  }

  async login(data: any) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error("Email and Password are required");
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(
      password,
      user.getDataValue("password")
    );

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

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

  async changePhoneRequest(data: any) {
    const { userId, phone } = data;

    if (!phone) {
      throw new Error("New phone number required");
    }

    validateIndianPhone(phone);

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    const expiry = Date.now() + 5 * 60 * 1000;

    await User.update(
      {
        temprory_phone: phone,
        otp,
        otp_expiry: expiry
      },
      {
        where: { id: userId }
      }
    );

    await sendSMS(phone, otp);
    return {
      message: "OTP sent to new phone number"
    };
  }


  async verifyChangePhone(data: any) {
    const { userId, otp } = data;

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    if (user.getDataValue("otp") !== otp) {
      throw new Error("Invalid OTP");
    }

    if (Date.now() > user.getDataValue("otp_expiry")) {
      throw new Error("OTP expired");
    }

    const newPhone = user.getDataValue("temprory_phone");

    if (!newPhone) {
      throw new Error("No phone change request found");
    }

    await user.update({
      phone: newPhone,
      temprory_phone: null,
      otp: null,
      otp_expiry: null
    });

    return {
      message: "Phone number updated successfully",
      phone: newPhone
    };
  }


}
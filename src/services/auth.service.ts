import { generateOTP } from "../utils/otp";
import { sendEmail } from "../utils/mail";
import { sendSMS } from "../utils/sms";
import { generateToken } from "../utils/jwt";
import { validateIndianPhone } from "../utils/phone";
import UserProfile from "../models/user-profile.model";
import bcrypt from "bcrypt";
// import { whatsappClient } from "../utils/whatsapp";
import { logger } from "../utils/logger";
import { ROLES, Role } from "../config/permissions";
import { validateEmail } from "../utils/validations";

export class AuthService {
  private async findUserByEmailOrPhone(email?: string, phone?: string) {
    if (email) {
      const user = await UserProfile.findOne({ where: { email } });
      if (user) {
        return user;
      }
    }

    if (phone) {
      return UserProfile.findOne({ where: { mobileNumber: phone } });
    }

    return null;
  }

  private formatUser(user: UserProfile) {
    return {
      id: user.getDataValue("id"),
      email: user.getDataValue("email"),
      name: user.getDataValue("fullName"),
      role: user.getDataValue("role"),
    };
  }

  async signup(data: any) {
    const { email, name, password, phone, role } = data;

    if (!email || !password || !name) {
      throw new Error("Email, Name and Password are required");
    }

    const validatedEmail = validateEmail(email);

    if (phone) {
      validateIndianPhone(phone);
    }

    const existingUser = await this.findUserByEmailOrPhone(email, phone);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const allowedRoles: Role[] = [ROLES.ADMIN, ROLES.STORE_OWNER, ROLES.USER];
    const assignedRole: Role = allowedRoles.includes(role) ? role : ROLES.USER;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserProfile.create({
      email: validatedEmail,
      fullName: name,
      password: hashedPassword,
      mobileNumber: phone,
      role: assignedRole,
    });

    return {
      message: `User registered successfully`,
      user: this.formatUser(user),
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

    const user = await this.findUserByEmailOrPhone(email, phone);

    if (!user) throw new Error("User not found");

    if (user.getDataValue("otp") !== otp) {
      throw new Error("Invalid OTP");
    }

    const otpExpiry = user.getDataValue("otp_expiry") as Date | null;

    if (!otpExpiry || Date.now() > otpExpiry.getTime()) {
      throw new Error("OTP expired");
    }

    await user.update({
      otp: null,
      otp_expiry: null
    });

    const token = generateToken({
      id: user.getDataValue("id"),
      email: user.getDataValue("email"),
      role: user.getDataValue("role"),
    });

    return {
      message: "Login successful",
      token,
      user: this.formatUser(user),
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

    const user = await this.findUserByEmailOrPhone(email, phone);

    if (!user) {
      throw new Error("User not found");
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await user.update({
      otp,
      otp_expiry: expiry
    });

    const finalEmail = user.getDataValue("email");
    const finalPhone = user.getDataValue("mobileNumber");
    let sent = false;
    const errors: string[] = [];

    if (finalEmail) {
      try {
        await sendEmail(finalEmail, otp, user.getDataValue("fullName") || "User");
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

    const user = await UserProfile.findOne({ where: { email } });

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
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    try {
      const user = await this.findUserByEmailOrPhone(email, phone);

      if (!user) {
        throw {
          statusCode: 404,
          message: "Account does not exist. Please signup first."
        };
      }

      await user.update({
        otp,
        otp_expiry: expiry
      });

      let sent = false;
      const errors: string[] = [];

      if (email) {
        try {
          await sendEmail(email, otp, user.getDataValue("fullName") || "User");
          sent = true;
        } catch (err: any) {
          errors.push(`Email failed: ${err?.message}`);
        }
      }

      if (phone) {
        try {
          await sendSMS(phone, otp);
          sent = true;
        } catch (err: any) {
          errors.push(`SMS failed: ${err?.message}`);
        }
      }


      if (!sent) {
        throw new Error(`OTP failed: ${errors.join("; ")}`);
      }

      return {
        message: "OTP sent successfully",
        sentVia: email ? "email" : "SMS",
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
      throw {
        statusCode: 400,
        message: "Email and Password are required"
      };
    }

    const validatedEmail = validateEmail(email);

    const user = await UserProfile.findOne({
      where: { email: validatedEmail }
    });

    if (!user) {
      throw {
        statusCode: 404,
        message: "Account does not exist. Please signup first."
      };
    }

    const hashedPassword = user.getDataValue("password") as string | null;

    if (!hashedPassword) {
      throw {
        statusCode: 401,
        message: "Invalid email or password"
      };
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      throw {
        statusCode: 401,
        message: "Invalid email or password"
      };
    }

    const token = generateToken({
      id: user.getDataValue("id"),
      email: user.getDataValue("email"),
      role: user.getDataValue("role"),
    });

    return {
      message: "Login successful",
      token,
      user: this.formatUser(user),
    };
  }

  async changePhoneRequest(data: any) {
    const { userId, phone } = data;

    if (!phone) {
      throw new Error("New phone number required");
    }

    validateIndianPhone(phone);

    const user = await UserProfile.findByPk(userId);
    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await UserProfile.update(
      {
        temprory_phone: phone,
        otp,
        otp_expiry: expiry,
      },
      {
        where: { id: userId },
      }
    );

    await sendSMS(phone, otp);
    return {
      message: "OTP sent to new phone number"
    };
  }


  async verifyChangePhone(data: any) {
    const { userId, otp } = data;

    const user = await UserProfile.findByPk(userId);
    if (!user) throw new Error("User not found");

    if (user.getDataValue("otp") !== otp) {
      throw new Error("Invalid OTP");
    }

    const otpExpiry = user.getDataValue("otp_expiry") as Date | null;

    if (!otpExpiry || Date.now() > otpExpiry.getTime()) {
      throw new Error("OTP expired");
    }

    const newPhone = user.getDataValue("temprory_phone");

    if (!newPhone) {
      throw new Error("No phone change request found");
    }

    await user.update({
      mobileNumber: newPhone,
      temprory_phone: null,
      otp: null,
      otp_expiry: null,
    });

    return {
      message: "Phone number updated successfully",
      phone: newPhone
    };
  }

  // ✅ SUPERADMIN only — change the role of any user
  async assignRole(data: { userId: string; role: string }) {
    const { userId, role } = data;

    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role as any)) {
      throw new Error(`Invalid role. Allowed: ${validRoles.join(", ")}`);
    }

    const user = await UserProfile.findByPk(userId);
    if (!user) throw new Error("User not found");

    await user.update({ role });

    return {
      message: `Role updated to '${role}' for user ${userId}`,
      userId,
      role,
    };
  }

}
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


async generateOtp(data: any) {
  const { email, phone } = data;

  if (!email && !phone) {
    throw new Error("Email or phone required");
  }

  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000;


  let user = await User.findOne({ where: { email } });

  if (user) {
    await user.update({
      otp,
      otp_expiry: expiry
    });
  } else {
    user = await User.create({
      email,
      phone,
      otp,
      otp_expiry: expiry
    });
  }


  if (email) {
    await sendEmail(email, otp);
  }

  if (phone) {
    await sendSMS(phone, otp);
  }

  return {
    message: "OTP generated and sent successfully"
  };
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
 
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
 
  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000;
 
  await User.update(
    {
      phone: phone,
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
 
  const newPhone = user.getDataValue("temp_phone");
 
  if (!newPhone) {
    throw new Error("No phone change request found");
  }
 
  await user.update({
    phone: newPhone,
    temp_phone: null,
    otp: null,
    otp_expiry: null
  });
 
  return {
    message: "Phone number updated successfully",
    phone: newPhone
  };
}
 

}
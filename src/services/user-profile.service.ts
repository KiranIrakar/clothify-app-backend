import UserProfile from "../models/user-profile.model";
import {
  UserProfileAttributes,
} from "../interface/user-profile.interface";
import bcrypt from "bcrypt";
import { CreateUserRequest } from "../interface/createuserrequest.interface";
import { Op } from "sequelize";

class UserProfileService {
  private buildProfilePayload(data: CreateUserRequest) {
    const payload: Partial<UserProfileAttributes> = {};

    if ("fullName" in data || "name" in data) {
      payload.fullName = data.fullName ?? data.name ?? null;
    }

    if ("email" in data) {
      payload.email = data.email ?? null;
    }

    if ("mobileNumber" in data || "phone" in data) {
      payload.mobileNumber = data.mobileNumber ?? data.phone ?? null;
    }

    if ("password" in data) {
      payload.password = data.password ?? null;
    }

    if ("isVerified" in data || "enabled" in data) {
      payload.isVerified = data.isVerified ?? data.enabled ?? false;
    }

    return payload;
  }

  async createUser(data: CreateUserRequest): Promise<UserProfileAttributes> {
    const payload = this.buildProfilePayload(data);

    if (!payload.fullName || !payload.email || !payload.mobileNumber) {
      throw new Error("fullName, email and mobileNumber are required");
    }

    const existingUser = await UserProfile.findOne({
      where: {
        [Op.or]: [
          { email: payload.email },
          { mobileNumber: payload.mobileNumber },
        ],
      },
    });

    if (existingUser) {
      throw new Error("User already exists with this email or mobile number");
    }

    if (
      (data.password || data.confirmPassword) &&
      data.password !== data.confirmPassword
    ) {
      throw new Error("Password and Confirm Password do not match");
    }

    const user = await UserProfile.create({
      ...payload,
      password: data.password ? await bcrypt.hash(data.password, 10) : null,
      isVerified: payload.isVerified ?? false,
    });

    return user.toJSON() as UserProfileAttributes;
  }

  async getAllUsers(): Promise<UserProfileAttributes[]> {
    const users = await UserProfile.findAll();
    return users.map((u) => u.toJSON() as UserProfileAttributes);
  }

  async getUserById(id: string): Promise<UserProfileAttributes | null> {
    const user = await UserProfile.findByPk(id);
    return user ? (user.toJSON() as UserProfileAttributes) : null;
  }

  async updateUser(
    id: string,
    data: CreateUserRequest
  ): Promise<UserProfileAttributes | null> {
    const user = await UserProfile.findByPk(id);
    if (!user) return null;

    const payload = this.buildProfilePayload(data);

    if (payload.email || payload.mobileNumber) {
      const conflictingUser = await UserProfile.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            ...(payload.email ? [{ email: payload.email }] : []),
            ...(payload.mobileNumber
              ? [{ mobileNumber: payload.mobileNumber }]
              : []),
          ],
        },
      });

      if (conflictingUser) {
        throw new Error("Another user already uses this email or mobile number");
      }
    }

    if (data.password || data.confirmPassword) {
      if (!data.password || !data.confirmPassword) {
        throw new Error("Both password and confirmPassword required");
      }

      if (data.password !== data.confirmPassword) {
        throw new Error("Password and Confirm Password do not match");
      }

      payload.password = await bcrypt.hash(data.password, 10);
    } else {
      delete (payload as Partial<typeof payload>).password;
    }

    await user.update(payload);

    return user.toJSON() as UserProfileAttributes;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await UserProfile.findByPk(id);
    if (!user) return false;

    await user.destroy();
    return true;
  }
}

export default new UserProfileService();

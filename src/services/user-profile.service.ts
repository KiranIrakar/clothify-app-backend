import UserProfile from "../models/user-profile.model";
import {
    UserProfileAttributes,
    UserProfileCreationAttributes,
} from "../interface/user-profile.interface";
import bcrypt from "bcrypt";
import { CreateUserRequest } from "../interface/createuserrequest.interface";

class UserProfileService {
    private normalizeUserPayload(
        data: CreateUserRequest
    ): UserProfileCreationAttributes {
        const { confirmPassword, ...rest } = data;

        return {
            ...rest,
            fullName: data.fullName ?? data.name ?? null,
            mobileNumber: data.mobileNumber ?? data.phone ?? null,
            isVerified: data.isVerified ?? data.enabled ?? false,
        };
    }

    async createUser(data: CreateUserRequest): Promise<UserProfileAttributes> {
        const normalizedData = this.normalizeUserPayload(data);

        if (!normalizedData.email || !normalizedData.fullName || !normalizedData.mobileNumber) {
            throw new Error("Email, fullName and mobileNumber are required");
        }

        const existingUser = await UserProfile.findOne({
            where: {
                email: normalizedData.email,
            }
        });

        if (existingUser) {
            throw new Error("User already exists with this email");
        }

        const existingPhoneUser = await UserProfile.findOne({
            where: {
                mobileNumber: normalizedData.mobileNumber,
            }
        });

        if (existingPhoneUser) {
            throw new Error("User already exists with this mobile number");
        }

        if (data.password !== data.confirmPassword) {
            throw new Error("Password and Confirm Password do not match");
        }

        const hashedPassword = data.password
            ? await bcrypt.hash(data.password, 10)
            : null;

        const { name, phone, enabled, ...rest } = normalizedData;

        const user = await UserProfile.create({
            ...rest,
            password: hashedPassword,
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
        const normalizedData = this.normalizeUserPayload(data);

        const user = await UserProfile.findByPk(id);
        if (!user) return null;

        if (data.password || data.confirmPassword) {
            if (!data.password || !data.confirmPassword) {
                throw new Error("Both password and confirmPassword required");
            }

            if (data.password !== data.confirmPassword) {
                throw new Error("Password and Confirm Password do not match");
            }

            normalizedData.password = await bcrypt.hash(data.password, 10);
        }

        if (normalizedData.email) {
            const existingEmailUser = await UserProfile.findOne({
                where: {
                    email: normalizedData.email,
                }
            });

            if (existingEmailUser && existingEmailUser.getDataValue("id") !== id) {
                throw new Error("User already exists with this email");
            }
        }

        if (normalizedData.mobileNumber) {
            const existingPhoneUser = await UserProfile.findOne({
                where: {
                    mobileNumber: normalizedData.mobileNumber,
                }
            });

            if (existingPhoneUser && existingPhoneUser.getDataValue("id") !== id) {
                throw new Error("User already exists with this mobile number");
            }
        }

        const { name, phone, enabled, ...rest } = normalizedData;

        await user.update(rest);

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

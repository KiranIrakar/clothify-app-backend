import UserProfile from "../models/user-profile.model";
import {
    UserProfileAttributes,
    UserProfileCreationAttributes,
} from "../interface/user-profile.interface";
import bcrypt from "bcrypt";
import { CreateUserRequest } from "../interface/createuserrequest.interface";

class UserProfileService {

    async createUser(data: CreateUserRequest): Promise<UserProfileAttributes> {

         const existingUser = await UserProfile.findOne({
        where: {
            email: data.email, 
        }
    });

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

        if (data.password !== data.confirmPassword) {
            throw new Error("Password and Confirm Password do not match");
        }

        const hashedPassword = data.password
            ? await bcrypt.hash(data.password, 10)
            : null;

        const { confirmPassword, ...rest } = data;

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

        const user = await UserProfile.findByPk(id);
        if (!user) return null;

        if (data.password || data.confirmPassword) {
            if (!data.password || !data.confirmPassword) {
                throw new Error("Both password and confirmPassword required");
            }

            if (data.password !== data.confirmPassword) {
                throw new Error("Password and Confirm Password do not match");
            }

            data.password = await bcrypt.hash(data.password, 10);
        }

        const { confirmPassword, ...rest } = data;

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
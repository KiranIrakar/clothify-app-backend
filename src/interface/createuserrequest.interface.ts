import { UserProfileCreationAttributes } from "./user-profile.interface";
export interface CreateUserRequest extends UserProfileCreationAttributes {
  confirmPassword?: string;
}
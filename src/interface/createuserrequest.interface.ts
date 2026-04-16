import { UserProfileCreationAttributes } from "./user-profile.interface";

export interface CreateUserRequest extends UserProfileCreationAttributes {
  name?: string;
  phone?: string;
  enabled?: boolean;
  confirmPassword?: string;
}

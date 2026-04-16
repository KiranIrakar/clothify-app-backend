
export interface UserProfileAttributes {
  id: string;
  fullName?: string | null;
  name?: string | null;
  email?: string | null;
  mobileNumber?: string | null;
  phone?: string | null;
  password: string | null;
  isVerified?: boolean;
  enabled?: boolean;
  role?: "ROLE_USER" | "ROLE_ADMIN";
  otp?: string | null;
  otp_expiry?: Date | number | null;
  temprory_phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfileCreationAttributes
  extends Partial<UserProfileAttributes> {}

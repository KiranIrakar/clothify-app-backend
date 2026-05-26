
export interface UserProfileAttributes {
  id: string;
  fullName: string | null;
  email: string | null;
  mobileNumber: string | null;
  password: string | null;
  isVerified: boolean;
  role?: string;
  otp?: string | null;
  otp_expiry?: Date | null;
  temprory_phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfileCreationAttributes
  extends Partial<UserProfileAttributes> {}
  
export enum USER_ROLE_ENUM {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  STORE_OWNER = "STORE_OWNER",
  ROLE_USER = "ROLE_USER",
}
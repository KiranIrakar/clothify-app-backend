
export interface UserProfileAttributes {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string | null;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfileCreationAttributes
  extends Partial<UserProfileAttributes> {}
export interface AddressAttributes {
  id?: string;
  user_id?: string;

  name: string;
  mobile: string;
  altMobile?: string;

  flat?: string;
  area?: string;
  address: string;

  type?: "home" | "work" | "other";

  lat?: number;
  lng?: number;

  selected?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
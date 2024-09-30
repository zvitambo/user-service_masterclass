import { AddressModel } from './AddressModel';
export interface UserModel {
  user_id?: number;
  email: string;
  password: string;
  salt: string;
  phone: string;
  verification_code?: number;
  expiry?: Date;
  first_name?: string;
  last_name?: string;
  verified?: boolean;
  userType: "BUYER" | "SELLER";
  address?: AddressModel[]
}
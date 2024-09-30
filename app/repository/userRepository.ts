import { ProfileInput } from "./../models/dto/AddressInput";
import { DBOperation } from "./dbOperations";
import { UserModel } from "./../models/UserModel";
import { DBClient } from "../utility";
import { AddressModel } from "app/models/AddressModel";

export class UserRepository extends DBOperation {
  constructor() {
    super();
  }

  async createAccount({ email, password, salt, phone, userType }: UserModel) {
    const queryString =
      "INSERT INTO users (email, password, salt, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [email, password, salt, phone, userType];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount > 0) {
      return result.rows[0] as UserModel;
    }
  }

  async findAccount(email: string) {
    const queryString =
      "SELECT  user_id, email, password, salt, phone, verification_code, expiry FROM  users where email = $1";
    const values = [email];
    const result = await this.executeQuery(queryString, values);

    if (result.rowCount < 1) {
      throw new Error("User with provided email does not exist");
    }
    return result.rows[0] as UserModel;
  }

  async updateVerificationCode(userId: number, code: number, expiry: Date) {
    const queryString =
      "UPDATE users SET verification_code=$1, expiry=$2 where user_id=$3 AND verified=FALSE RETURNING *";
    const values = [code, expiry, userId];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount > 0) {
      return result.rows[0] as UserModel;
    }
  }

  async updateVerifyUser(userId: number) {
    const queryString =
      "UPDATE users SET verified=TRUE where user_id=$1 AND verified=FALSE RETURNING *";
    const values = [userId];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount > 0) {
      return result.rows[0] as UserModel;
    }
    throw new Error("user already verified!");
  }

  async updateUser(
    userId: number,
    firstName: string,
    lastName: string,
    userType: string
  ) {
    const queryString =
      "UPDATE users SET first_name=$2, last_name=$3, user_type=$4 where user_id=$1 AND verified=FALSE RETURNING *";
    const values = [userId, firstName, lastName, userType];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount > 0) {
      return result.rows[0] as UserModel;
    }
    throw new Error("error updating user details");
  }

  async createUserProfile(
    userId: number,
    {
      firstName,
      lastName,
      userType,
      address: { addressLine1, addressLine2, city, postCode, country },
    }: ProfileInput
  ) {
    const updatedUser = await this.updateUser(
      userId,
      firstName,
      lastName,
      userType
    );
    const queryString =
      "INSERT INTO address (user_id, address_line1, address_line2, city, post_code, country) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const values = [
      userId,
      addressLine1,
      addressLine2,
      city,
      postCode,
      country,
    ];
    const result = await this.executeQuery(queryString, values);
    if (result.rowCount > 0) {
      return result.rows[0] as AddressModel;
      return { updatedUser, result };
    }

    throw new Error("error while creating profile");
  }

  async getUserProfile(userId: number) {
    const profileQuery =
      "SELECT first_name, last_name, email, phone, user_type, verified FROM users WHERE user_id=$1";
    const profileValues = [userId];
    const profileResult = await this.executeQuery(profileQuery, profileValues);
    if (profileResult.rowCount < 1) {
      throw new Error("user profile does not exist");
    }
    const userProfile = profileResult.rows[0] as UserModel;

    const addressQuery =
      "SELECT  id, address_line1, address_line2, city, post_code, country FROM address WHERE user_id=$1";
    const addressValues = [userId];
    const addressResult = await this.executeQuery(addressQuery, addressValues);
    if (addressResult.rowCount > 0) {
      userProfile.address = addressResult.rows as AddressModel[];
    }

    return userProfile;
  }
  async editUserProfile(
    userId: number,
    {
      firstName,
      lastName,
      userType,
      address: {id, addressLine1, addressLine2, city, postCode, country },
    }: ProfileInput
  ) {
    await this.updateUser(
      userId,
      firstName,
      lastName,
      userType
    );
    const addressQuery =
      "UPDATE address set address_line1 = $1, address_line2 = $2, city  = $3, post_code = $4, country = $5 WHERE id = $6 ";
    const addressValues = [
      addressLine1,
      addressLine2,
      city,
      postCode,
      country,
      id,
    ];
    const result = await this.executeQuery(addressQuery, addressValues);
    if (result.rowCount < 1) {
      throw new Error("error updating profile");
    }

    return true;

    
  }
}

import { timeDifference } from "./../utility/dateHelper";
import {
  generateAccessCode,
  sendVerificationCode,
} from "./../utility/notification";
import {
  generateSalt,
  GetHashedPassword,
  getToken,
  validatePassword,
  verifyToken,
} from "./../utility/password";
import { SignupInput } from "./../models/dto/SignupInput";
import { SuccessResponse, ErrorResponse } from "./../utility/response";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { UserRepository } from "../repository/userRepository";
import { autoInjectable } from "tsyringe";
import { plainToClass } from "class-transformer";
import { AppValidationError } from "./../utility/error";
import { LoginInput } from "../models/dto/LoginInput";
import { VerificationInput } from "app/models/dto/UpdateInput";
import { ProfileInput } from "app/models/dto/AddressInput";

@autoInjectable()
export class UserService {
  repository: UserRepository;
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  async serviceWithError(event: APIGatewayProxyEventV2) {
    return ErrorResponse(403, "verification code expired");
  }

  //User
  async createUser(event: APIGatewayProxyEventV2) {
    // const body = JSON.parse(event.body);

    //using middy in handler
    //const body = event.body;
    try {
      const input = plainToClass(SignupInput, event.body);
      const error = await AppValidationError(input);
      if (error) return ErrorResponse(404, error);
      const salt = await generateSalt();
      const hashPassword = await GetHashedPassword(input.password, salt);

      const data = await this.repository.createAccount({
        email: input.email,
        password: hashPassword,
        salt: salt,
        phone: input.phone,
        userType: "BUYER",
      });

      return SuccessResponse({ data });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async loginUser(event: APIGatewayProxyEventV2) {
    try {
      console.log("data");
      const input = plainToClass(LoginInput, event.body);
      const error = await AppValidationError(input);
      if (error) return ErrorResponse(404, error);

      const data = await this.repository.findAccount(input.email);
      console.log("data", data);
      const verify = await validatePassword(
        input.password,
        data.password,
        data.salt
      );
      if (!verify) throw new Error("Invalid password");
      const token = getToken(data);
      return SuccessResponse({ token });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async getVerificationToken(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    const payload = await verifyToken(token);
    if (!payload) return ErrorResponse(403, "authorization failed");
    const { code, expiry } = await generateAccessCode();
    await this.repository.updateVerificationCode(payload.user_id, code, expiry);
    const response = await sendVerificationCode(code, payload.phone);
    return SuccessResponse({
      message: "verification code has been sent to your registered number",
    });
  }

  async verifyUser(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    const payload = await verifyToken(token);
    if (!payload) return ErrorResponse(403, "authorization failed");
    const input = plainToClass(VerificationInput, event.body);
    const error = await AppValidationError(input);
    if (error) return ErrorResponse(404, error);

    const { verification_code, expiry } = await this.repository.findAccount(
      payload.email
    );
    if (verification_code === parseInt(input.code)) {
      const currentTime = new Date().toISOString();
      const diff = timeDifference(expiry.toISOString(), currentTime, "m");

      if (diff > 0) {
        await this.repository.updateVerifyUser(payload.user_id);
      } else {
        return ErrorResponse(403, "verification code expired");
      }
    }

    return SuccessResponse({
      message: "User Verified",
    });
  }

  //Profile
  async createUserProfile(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      const payload = await verifyToken(token);
      if (!payload) return ErrorResponse(403, "authorization failed");

      const input = plainToClass(ProfileInput, event.body);
      const error = await AppValidationError(input);
      if (error) return ErrorResponse(404, error);

      const result = await this.repository.createUserProfile(
        payload.user_id,
        input
      );
      
      return SuccessResponse({
        message: "user profile created successfully",
      });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async getUserProfile(event: APIGatewayProxyEventV2) {

    try {
      const token = event.headers.authorization;
      const payload = await verifyToken(token);
      if (!payload) return ErrorResponse(403, "authorization failed");

      const result = await this.repository.getUserProfile(payload.user_id);
      return SuccessResponse(result);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async updateUserProfile(event: APIGatewayProxyEventV2) {
     try {
       const token = event.headers.authorization;
       const payload = await verifyToken(token);
       if (!payload) return ErrorResponse(403, "authorization failed");

       const input = plainToClass(ProfileInput, event.body);
       const error = await AppValidationError(input);
       if (error) return ErrorResponse(404, error);

      await this.repository.editUserProfile(
         payload.user_id,
         input
       );
       
       return SuccessResponse({
         message: "user profile updated successfully",
       });
     } catch (error) {
       console.log(error);
       return ErrorResponse(500, error);
     }
  }

  //Cart
  async createCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from verify user" });
  }

  async getCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from verify user" });
  }

  async updateCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from verify user" });
  }

  //Payment
  async createPaymentMethod(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from verify user" });
  }

  async getPaymentMethod(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from verify user" });
  }

  async updatePaymentMethod(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from verify user" });
  }
}

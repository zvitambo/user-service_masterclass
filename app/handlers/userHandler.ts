import { HttpMethod, ErrorResponse } from "../utility";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { UserService } from "../service/userService";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { container } from "tsyringe";

const service = container.resolve(UserService);

export const Signup = middy((event: APIGatewayProxyEventV2) => {
  return service.createUser(event); 
}).use(jsonBodyParser());

export const Login = middy((event: APIGatewayProxyEventV2) => {
  return service.loginUser(event);
}).use(jsonBodyParser());

export const Verify = middy((event: APIGatewayProxyEventV2) => {
  const httpMethod = event.requestContext.http.method.toLowerCase();
  switch (httpMethod) {
    case HttpMethod.POST:
      return service.verifyUser(event);
    case HttpMethod.GET:
      return service.getVerificationToken(event);
    default:
      return service.serviceWithError(event);
  }
}).use(jsonBodyParser());



export const Profile = middy((event: APIGatewayProxyEventV2) => {
  const httpMethod = event.requestContext.http.method.toLowerCase();
  switch (httpMethod) {
    case HttpMethod.POST:
      return service.createUserProfile(event);
    case HttpMethod.PUT:
      return service.updateUserProfile(event);
    case HttpMethod.GET:
      return service.getUserProfile(event);
    default:
      return service.serviceWithError(event);
  }
}).use(jsonBodyParser());


export const Cart = middy((event: APIGatewayProxyEventV2) => {
 const httpMethod = event.requestContext.http.method.toLowerCase();
 switch (httpMethod) {
   case HttpMethod.POST:
     return service.createCart(event);
   case HttpMethod.PUT:
     return service.updateCart(event);
   case HttpMethod.GET:
     return service.getCart(event);
   default:
     return service.serviceWithError(event);
 }
}).use(jsonBodyParser());


export const Payment = middy((event: APIGatewayProxyEventV2) => {
  const httpMethod = event.requestContext.http.method.toLowerCase();
  switch (httpMethod) {
    case HttpMethod.POST:
      return service.createPaymentMethod(event);
    case HttpMethod.PUT:
      return service.updatePaymentMethod(event);
    case HttpMethod.GET:
      return service.getPaymentMethod(event);
    default:
      return service.serviceWithError(event);
  }
}).use(jsonBodyParser());











import { UserModel } from "../models/UserModel";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
const App_Secret = 'our_app_secret';


export const generateSalt = async () => {
    return await bcrypt.genSalt();
}


export const GetHashedPassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt);
};


export const validatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
    return (await GetHashedPassword(enteredPassword, salt)) === savedPassword;
};


export const getToken =  ({ email, user_id, phone, userType }: UserModel) => {
  return jwt.sign({ email, user_id, phone, userType }, App_Secret, {
    expiresIn: "30d",
  });
};

export const verifyToken = async (token: string): Promise<UserModel | false> => {
    try {
        if(token !==""){
            const payload = await jwt.verify(token.split(" ")[1], App_Secret);
            return payload as UserModel;
        }
        return false;
        
    } catch (error) {
        console.log(error);        
        return false;
        
    }
}

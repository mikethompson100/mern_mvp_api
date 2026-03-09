import { verify } from "jsonwebtoken";
import UserModel from "./UserModel";

export default async function authenticate(token?: string) {
  if (!token) {
    throw new Error("Token missing")
  }
  if (!process.env.SIGNATURE) {
    throw new Error("Signature undefined")
  }
  // String to Object
  const data = verify(token, process.env.SIGNATURE);
  if (typeof data === "string") {
    throw new Error("Invalid token")
  }
  const user = await UserModel.findById(data.userId);
  if (!user) {
    throw new Error("User not found.")
  }
  return user;
}

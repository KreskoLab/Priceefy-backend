import { User } from "../../users/schemas/user";

export interface LoginResponse {
  token: string;
  user: User;
}

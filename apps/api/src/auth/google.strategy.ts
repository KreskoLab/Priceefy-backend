import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { config } from "dotenv";
import { CreateUserDto } from "../users/dto/create-user.dto";

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT,
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { displayName, id, photos } = profile;

    const user = {
      name: displayName,
      googleId: id,
      avatar: photos[0].value,
    } as CreateUserDto;

    return user;
  }
}

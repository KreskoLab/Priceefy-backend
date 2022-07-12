import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./google.strategy";

@Module({
  imports: [JwtModule.register({ secret: "hard!to-guess_secret" }), UsersModule],
  providers: [AuthService, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}

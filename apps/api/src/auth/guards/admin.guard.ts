import { Injectable, CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { Request } from "express";
import { UsersService } from "../../users/users.service";
import { AuthService } from "../auth.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;

    if (request.headers["cookie"]) {
      const token = request.headers["cookie"]
        .split(";")
        .find((item) => item.includes("accessToken"))
        ?.replace("accessToken=", "")
        .trim();

      const valid = await this.authService.validate(token);

      if (valid) {
        const userId = this.authService.decode(token);
        const user = await this.usersService.getUserById(userId);

        if (user && user.admin) return true;
        else return false;
      } else return false;
    } else return false;
  }
}

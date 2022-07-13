import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/schemas/user";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private async generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { id: userId },
      {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: this.configService.get<string>("JWT_LIFETIME"),
      },
    );
  }

  public async login(data: CreateUserDto): Promise<string> {
    const user = await this.usersService.getUserByGoogleId(data.googleId);

    if (!user) {
      const newUser = await this.usersService.addUser(data);
      const accessToken = await this.generateAccessToken(newUser._id);

      return accessToken;
    } else {
      return this.generateAccessToken(user._id);
    }
  }

  public async validate(token: string): Promise<User> {
    try {
      await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>("JWT_SECRET") });
      const decoded = this.jwtService.decode(token);
      return this.usersService.getUserById(decoded["id"]);
    } catch (error) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
  }
}

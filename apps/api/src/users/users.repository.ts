import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { User, UserDocument } from "./schemas/user";

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly model: Model<UserDocument>) {}

  async create(user: CreateUserDto): Promise<User> {
    return this.model.create(user);
  }

  async findByGoogleId(id: string): Promise<User> {
    return this.model.findOne({ googleId: id });
  }

  async findById(id: string): Promise<User> {
    return this.model.findById(id);
  }

  async updateById(id: string, value: string): Promise<User> {
    return this.model.findByIdAndUpdate(
      id,
      [
        {
          $set: {
            favorites: {
              $cond: [
                {
                  $in: [value, "$favorites"],
                },
                {
                  $setDifference: ["$favorites", [value]],
                },
                {
                  $concatArrays: ["$favorites", [value]],
                },
              ],
            },
          },
        },
      ],
      { new: true },
    );
  }
}

import { User } from "apps/api/src/users/schemas/user";
import { productStub } from "@app/products";

export const userStub = (): User => {
  return {
    _id: "123455",
    googleId: "1525346345345r3",
    name: "Test",
    avatar: "http://google.com/1.png",
    admin: false,
    favorites: [productStub()._id],
  };
};

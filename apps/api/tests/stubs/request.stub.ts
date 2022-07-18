import { Request } from "express";
import { tokenStub } from "./token.stub";

export const requestStub = () => {
  return {
    headers: {
      cookie: `accessToken=${tokenStub()}`,
    },
  } as Request;
};

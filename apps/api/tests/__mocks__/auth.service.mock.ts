import { userStub } from "../stubs/user.stub";
import { tokenStub } from "../stubs/token.stub";

export const MockAuthService = jest.fn().mockReturnValue({
  validate: jest.fn().mockResolvedValue(true),
  decode: jest.fn().mockReturnValue(userStub()._id),
  login: jest.fn().mockResolvedValue(tokenStub()),
});

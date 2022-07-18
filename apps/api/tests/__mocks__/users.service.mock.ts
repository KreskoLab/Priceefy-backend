import { userStub } from "../stubs/user.stub";

export const MockUsersService = jest.fn().mockReturnValue({
  getUserById: jest.fn().mockResolvedValue(userStub()),
  getFavorites: jest.fn().mockResolvedValue(userStub().favorites),
  handleFavorite: jest.fn().mockResolvedValue(userStub().favorites),
});

import { aggregationStub } from "../stubs/aggregation.stub";
import { storeStub } from "../stubs/store.stub";

export const StoresRepositoryMock = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(storeStub()),
  aggregateProducts: jest.fn().mockResolvedValue([aggregationStub()]),
  bulkWrite: jest.fn().mockImplementation(),
});

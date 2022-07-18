import { City } from "@app/stores";
import { cityStub } from "../stubs/city.stub";
import { localStoreStub } from "../stubs/local-store.stub";
import { aggregationStub } from "../stubs/aggreagation.stub";

export const getCities = (): Pick<City, "name" | "slug"> => {
  const { name, slug } = cityStub();
  return { name, slug };
};

export const MockStoresService = jest.fn().mockReturnValue({
  getStores: jest.fn().mockResolvedValue([localStoreStub()]),
  getCities: jest.fn().mockResolvedValue([getCities()]),
  getProducts: jest.fn().mockResolvedValue(aggregationStub()),
});

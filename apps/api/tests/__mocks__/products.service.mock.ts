import { aggregationStub } from "../stubs/aggreagation.stub";
import { productStub } from "@app/products";
import { Price } from "@app/products";
import { priceStub } from "@app/products";

const getPrices = (): Pick<Price, "price" | "store" | "created_at"> => {
  const { price, store, created_at } = priceStub();

  return {
    price,
    store,
    created_at,
  };
};

export const MockProductsService = jest.fn().mockReturnValue({
  getAll: jest.fn().mockResolvedValue(aggregationStub()),
  search: jest.fn().mockResolvedValue([productStub()]),
  getBySlug: jest.fn().mockResolvedValue(productStub()),
  getByIds: jest.fn().mockResolvedValue([productStub()]),
  getPrices: jest.fn().mockResolvedValue([getPrices()]),
});

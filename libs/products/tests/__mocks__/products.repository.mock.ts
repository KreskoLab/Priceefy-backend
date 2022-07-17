import { AggregationResults, Price, Product } from "@app/products";
import { priceStub } from "../stubs/price.stub";
import { productStub } from "../stubs/product.stub";

export const findBySlug = (): Pick<Product, "_id" | "category" | "slug"> => {
  const { _id, category, slug } = productStub();

  return {
    _id,
    category,
    slug,
  };
};

export const aggregatePrices = (): Pick<Price, "price" | "store" | "created_at"> => {
  const { price, store, created_at } = priceStub();

  return {
    price,
    store,
    created_at,
  };
};

export const findAll = (): AggregationResults => {
  const { _id, ...rest } = productStub();

  return {
    count: 30,
    results: [rest],
  };
};

export const searchAggregation = (): { ids: string[] } => {
  return {
    ids: [productStub().slug],
  };
};

export const ProductsRepositoryMock = jest.fn().mockReturnValue({
  create: jest.fn().mockImplementation(),
  findBySlugs: jest.fn().mockResolvedValue([findBySlug()]),
  aggregateByIds: jest.fn().mockResolvedValue([productStub()]),
  aggregatePrices: jest.fn().mockResolvedValue([aggregatePrices()]),
  findBySlug: jest.fn().mockResolvedValue([productStub()]),
  findAll: jest.fn().mockResolvedValue([findAll()]),
  searchAggregation: jest.fn().mockResolvedValue([searchAggregation()]),
});

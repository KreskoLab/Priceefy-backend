import { Product } from "@app/products";
import { aggregationStub } from "../stubs/aggreagation.stub";
import { categoryStub } from "../stubs/category.stub";

export const getAllIdsAndSlugs = (): Pick<Product, "_id" | "slug"> => {
  const { _id, slug } = categoryStub();

  return {
    _id,
    slug,
  };
};

export const CategoriesRepositoryMock = jest.fn().mockReturnValue({
  updateCategoryProducts: jest.fn().mockImplementation(),
  create: jest.fn().mockResolvedValue(categoryStub()),
  getOneBySlug: jest.fn().mockResolvedValue(categoryStub()),
  getAllCategories: jest.fn().mockResolvedValue([categoryStub()]),
  getAllIdsAndSlugs: jest.fn().mockResolvedValue([getAllIdsAndSlugs()]),
  getProducts: jest.fn().mockResolvedValue([aggregationStub()]),
});

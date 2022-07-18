import { localCategoryStub } from "../stubs/local-category.stub";
import { aggregationStub } from "../stubs/aggreagation.stub";
import { categoryStub } from "@app/categories";

export const MockCategoriesService = jest.fn().mockReturnValue({
  getCategories: jest.fn().mockResolvedValue([localCategoryStub()]),
  create: jest.fn().mockResolvedValue([categoryStub()]),
  getProducts: jest.fn().mockResolvedValue(aggregationStub()),
});

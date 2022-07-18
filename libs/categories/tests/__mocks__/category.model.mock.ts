import { Category } from "@app/categories";
import { AggregationResults } from "@app/products";
import { aggregationStub } from "../stubs/aggreagation.stub";
import { categoryStub } from "../stubs/category.stub";

export class MockCategoryModel {
  public findResults;

  async create(): Promise<Category> {
    return categoryStub();
  }

  async find(): Promise<Category[]> {
    return [this.findResults];
  }

  async findOne(): Promise<Category> {
    return categoryStub();
  }

  async bulkWrite(): Promise<void> {}

  async aggregate(): Promise<AggregationResults[]> {
    return [aggregationStub()];
  }
}

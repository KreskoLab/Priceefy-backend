import { Product } from "@app/products";
import { productStub } from "../stubs/product.stub";

export class MockProductModel {
  public aggregationResults;

  async bulkWrite(): Promise<void> {}

  async find(): Promise<Pick<Product, "_id" | "category" | "slug">[]> {
    const stub = productStub();
    return [{ _id: stub._id, category: stub.category, slug: stub.slug }];
  }

  async aggregate(): Promise<any> {
    return this.aggregationResults;
  }
}

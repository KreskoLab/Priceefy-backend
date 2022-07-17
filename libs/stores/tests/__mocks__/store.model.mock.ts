import { AggregationResults } from "@app/products";
import { Store } from "@app/stores";
import { aggregationStub } from "../stubs/aggregation.stub";
import { storeStub } from "../stubs/store.stub";

export class MockStoreModel {
  async create(): Promise<Store> {
    return storeStub();
  }

  async bulkWrite(): Promise<void> {}

  async aggregate(): Promise<AggregationResults[]> {
    return [aggregationStub()];
  }
}

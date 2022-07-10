import { Product } from "@app/products";

export interface AggregationResults {
  results: Omit<Product, "_id">[];
  count: number;
}

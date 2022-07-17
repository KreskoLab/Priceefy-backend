import { Price } from "@app/products";
import { priceStub } from "./price.stub";

export const PricesAggregationResultsStub = (): Pick<Price, "price" | "store" | "created_at"> => {
  const { price, created_at } = priceStub();

  return {
    price,
    created_at,
    store: "Сільпо",
  };
};

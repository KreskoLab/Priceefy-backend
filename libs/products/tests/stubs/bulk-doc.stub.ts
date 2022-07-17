import { priceStub } from "./price.stub";
import { productStub } from "./product.stub";

export const bulkDocStub = () => {
  return {
    updateOne: {
      filter: { slug: productStub().slug },
      update: {
        $setOnInsert: productStub(),
        $addToSet: { prices: priceStub() },
      },
      upsert: true,
    },
  };
};

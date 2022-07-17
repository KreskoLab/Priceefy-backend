import { priceStub } from "./price.stub";
import { productStub } from "./product.stub";

export const bulkDocStub = () => {
  const { _id, ...rest } = productStub();

  return {
    updateOne: {
      filter: { slug: rest.slug },
      update: {
        $setOnInsert: rest,
        $addToSet: { prices: priceStub() },
      },
      upsert: true,
    },
  };
};

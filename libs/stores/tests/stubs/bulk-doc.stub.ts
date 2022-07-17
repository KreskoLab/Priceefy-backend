import { storeStub } from "./store.stub";

export const bulkDocStub = () => {
  return {
    updateOne: {
      filter: { slug: storeStub().slug },
      update: {
        $addToSet: { products: storeStub().products },
      },
    },
  };
};

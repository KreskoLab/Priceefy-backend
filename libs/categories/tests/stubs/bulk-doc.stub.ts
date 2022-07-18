import { categoryStub } from "./category.stub";

export const bulkDocStub = () => {
  const { _id, products } = categoryStub();

  return {
    updateOne: {
      filter: { _id: _id },
      update: {
        $addToSet: { products: products },
      },
    },
  };
};

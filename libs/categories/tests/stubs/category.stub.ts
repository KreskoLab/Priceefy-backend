import { Category } from "@app/categories";

export const categoryStub = (): Category => {
  return {
    _id: "1234456",
    name: "Test",
    slug: "test",
    products: [],
  };
};

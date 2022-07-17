import { Store } from "@app/stores";

export const storeStub = (): Store => {
  return {
    _id: "12345",
    name: "Test",
    slug: "test",
    products: [],
  };
};

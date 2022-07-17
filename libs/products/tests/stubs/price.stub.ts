import { Price, Product } from "@app/products";

export const priceStub = (): Price => {
  return {
    city: "kyiv",
    store: "silpo",
    price: 40,
    created_at: new Date("2022-07-17"),
    discount: false,
    in_stock: true,
  };
};

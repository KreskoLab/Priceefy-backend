import { Product } from "@app/products";
import { priceStub } from "./price.stub";

export const productStub = (): Product => {
  return {
    _id: "12345",
    name: "Pepsi max",
    slug: "pepsi-max",
    category: "12334556677",
    country: "укрїна",
    image: "http://localhost:8000/image.png",
    trademark: "Pepsi",
    unit: "ml",
    weight: 2000,
    prices: [priceStub()],
  };
};

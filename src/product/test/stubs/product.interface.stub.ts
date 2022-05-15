import mongoose from "mongoose";
import { ProductInterface } from "src/scanner/interfaces/product.interface";

export const productInterfaceStub = (): ProductInterface => {
  return {
    name: "Яблуко",
    slug: "yabluko",
    category: new mongoose.Types.ObjectId(),
    trademark: "без тм",
    weight: 1,
    unit: "kg",
    country: "україна",
    image: "yabluko.png",
    price: {
      product: "yabluko",
      store: "eko",
      city: "kyiv",
      price: 12.9,
      discount: false,
      discount_price: 12.9,
      discount_end: new Date(),
      createdAt: 1622222222,
    },
  };
};

import { Category } from "src/category/schemas/category.schema";
import { Product } from "src/product/schemas/product.schema";

export const productStub = (): Product => {
  return {
    _id: "12",
    name: "Яблуко",
    slug: "yabluko",
    category: {
      _id: "124",
    } as Category,
    trademark: "без тм",
    weight: 1,
    unit: "kg",
    country: "україна",
    image: "yabluko.png",
    prices: [],
  };
};

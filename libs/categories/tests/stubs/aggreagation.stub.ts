import { AggregationResults } from "@app/products";

export const aggregationStub = (): AggregationResults => {
  return {
    count: 30,
    results: [
      {
        name: "Coca-cola",
        slug: "coca-cola",
        category: "soft-drinks",
        country: "україна",
        image: "http://localhost:3000/image.png",
        trademark: "Coca-Cola",
        unit: "ml",
        weight: 2000,
        prices: [
          {
            city: "kyiv",
            created_at: new Date("2022-07-17"),
            discount: false,
            in_stock: true,
            price: 70,
            store: "silpo",
          },
        ],
      },
    ],
  };
};

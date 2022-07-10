interface Item {
  name: string;
  unit: string;
  price: number;
  mainImage: string;
  storeQuantity: number;
  quantity: number;
  priceStopAfter: string | null;
  parameters: [
    {
      key: "trademark";
      value: string;
    },

    {
      key: "country";
      value: string;
    },
  ];
}

export interface SilpoResponse {
  itemsCount: number;
  items: Item[];
}

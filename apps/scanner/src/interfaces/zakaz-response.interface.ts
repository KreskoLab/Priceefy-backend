interface Res {
  title: string;
  price: number;
  unit: string;
  volume: number;
  bundle: number;
  country: string;
  weight: number;
  pack_amount: number | null;
  in_stock: boolean;
  discount: {
    status: boolean;
    value: number;
    old_price: number;
    due_date: string | null;
  };
  img: {
    s150x150: string;
    s200x200: string;
    s350x350: string;
    s1350x1350: string;
  };
  producer: {
    trademark: string;
  };
}

export interface ZakazResponse {
  count: number;
  results: Res[];
}

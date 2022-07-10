export interface Price {
  price: number;
  city: string;
  store: string;
  discount: boolean;
  discount_end?: string;
  created_at: string;
  in_stock: boolean;
}

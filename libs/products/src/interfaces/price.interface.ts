export interface Price {
  price: number;
  city: string;
  store: string;
  discount: boolean;
  discount_end?: string;
  created_at: Date;
  in_stock: boolean;
}

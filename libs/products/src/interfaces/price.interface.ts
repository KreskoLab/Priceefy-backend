export interface Price {
  price: number;
  city: string;
  store: string;
  discount: boolean;
  discount_end?: Date;
  created_at: Date;
  in_stock: boolean;
}

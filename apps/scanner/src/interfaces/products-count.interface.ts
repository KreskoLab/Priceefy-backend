import { CreateProductDto } from "@app/products";

export interface ProductsAndCount {
  products: CreateProductDto[];
  count: number;
}

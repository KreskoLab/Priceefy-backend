import { Category } from "@app/categories";
import { Product } from "@app/products";
import { Store } from "@app/stores";

export interface ProductsResponse {
  categories: {
    id: Category["_id"];
    products: Product["_id"][];
  }[];
  stores: {
    slug: Store["slug"];
    products: Product["_id"][];
  }[];
}

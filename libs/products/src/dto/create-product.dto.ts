import { Price } from "../interfaces/price.interface";

export class CreateProductDto {
  name: string;
  slug: string;
  category: string;
  image: string;
  weight: number;
  unit: string;
  trademark: string;
  country: string;
  price: Price;
}

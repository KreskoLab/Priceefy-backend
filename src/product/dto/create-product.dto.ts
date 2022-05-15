import { CreatePriceDto } from "../../price/dto/create-price.dto";

export interface CreateProductDto {
  name: string;
  slug: string;
  image: string;
  weight: number;
  unit: string;
  trademark: string;
  country: string;
  price: CreatePriceDto;
}

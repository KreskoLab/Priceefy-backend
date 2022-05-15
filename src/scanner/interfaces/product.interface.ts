import { CreatePriceDto } from "../../price/dto/create-price.dto";
import mongoose from "mongoose";

export interface ProductInterface {
  name: string;
  slug: string;
  image: string;
  category: mongoose.Types.ObjectId;
  weight: number;
  unit: string;
  trademark: string;
  country: string;
  price: CreatePriceDto;
}

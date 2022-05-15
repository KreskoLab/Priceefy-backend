import { Injectable } from "@nestjs/common";
import { Product } from "./schemas/product.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { CreateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductRepository {
  constructor(@InjectModel("Product") private readonly model: Model<Product>) {}

  async create(products: CreateProductDto[]): Promise<void> {
    await this.model.bulkWrite(products);
  }

  async findProductsCategoriesIdsInArray(slugs: string[]): Promise<Product[]> {
    return await this.model.find({ slug: { $in: slugs } }, { category: 1 });
  }
}

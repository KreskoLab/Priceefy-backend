import { Injectable } from "@nestjs/common";
import { Product } from "./schemas/product.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class ProductRepository {
  constructor(@InjectModel("Product") private model: Model<Product>) {}

  async create(products: object[]): Promise<void> {
    await this.model.bulkWrite(products);
  }

  async findProductsCategoriesIdsInArray(slugs: string[]): Promise<Product[]> {
    return this.model.find({ slug: { $in: slugs } }, { category: 1 });
  }
}

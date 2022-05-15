import { Category } from "./schemas/category.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryRepository {
  constructor(@InjectModel("Category") private readonly model: Model<Category>) {}

  async getOneBySlug(slug: string): Promise<Category> {
    return await this.model.findOne({ slug: slug });
  }

  async getAllCategories(): Promise<Array<Category>> {
    return await this.model.find({ products: { $exists: true, $not: { $size: 0 } } });
  }

  async getAllIdsAndSlugs(): Promise<Array<Category>> {
    return await this.model.find({}, { _id: 1, slug: 1 });
  }

  async updateCategoryProducts(bulkDocs: Array<any>): Promise<void> {
    await this.model.bulkWrite(bulkDocs);
  }
}

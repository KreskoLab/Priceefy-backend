import { UtilsService } from "./../utils/utils.service";
import { CategoryRepository } from "./category.repository";
import { Injectable } from "@nestjs/common";
import { Category } from "./schemas/category.schema";

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository, private readonly utilsService: UtilsService) {}

  async getIds(): Promise<Category[]> {
    return this.categoryRepository.getAllIdsAndSlugs();
  }

  async getAll(): Promise<Category[]> {
    return this.categoryRepository.getAllCategories();
  }

  async updateProducts(products: Array<any>): Promise<boolean> {
    const bulkDocs = [];

    products.forEach((item: any) => {
      const bulkDoc = {
        updateOne: {
          filter: { _id: item.category },
          update: {
            $addToSet: { products: item.products },
          },
        },
      };
      bulkDocs.push(bulkDoc);
    });

    try {
      await this.categoryRepository.updateCategoryProducts(bulkDocs);
      return true;
    } catch (error) {
      return false;
    }
  }
}

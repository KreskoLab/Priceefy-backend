import { UtilsService } from "@app/utils";
import { CategoriesRepository } from "./categories.repository";
import { Injectable } from "@nestjs/common";
import { Category } from "./schemas/category.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { LocalCategory } from "./interfaces/category.interface";
import { AggregationResults, ProductsResponse, Sort } from "@app/products";

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoriesRepository, private readonly utilsService: UtilsService) {}

  async getIds(): Promise<Category[]> {
    return this.categoryRepository.getAllIdsAndSlugs();
  }

  async getAll(): Promise<Category[]> {
    return this.categoryRepository.getAllCategories();
  }

  async getProducts(
    slug: string,
    page: number,
    sort: Sort,
    store?: string,
    city?: string,
  ): Promise<AggregationResults> {
    const res = await this.categoryRepository.getProducts(slug, page, sort, store, city);
    return res[0];
  }

  async create(category: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create(category);
  }

  async getCategories(): Promise<Partial<LocalCategory>[]> {
    const res = await this.utilsService.readData<LocalCategory[]>("categories.json");
    return res.map(({ name, slug, icon }) => ({ name, slug, icon }));
  }

  async updateProducts(products: Pick<ProductsResponse, "categories">): Promise<void> {
    const bulkDocs = [];

    products.categories.forEach((item) => {
      const bulkDoc = {
        updateOne: {
          filter: { _id: item.id },
          update: {
            $addToSet: { products: item.products },
          },
        },
      };
      bulkDocs.push(bulkDoc);
    });

    await this.categoryRepository.updateCategoryProducts(bulkDocs);
  }
}

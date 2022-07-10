import { Injectable } from "@nestjs/common";
import { Product } from "./schemas/products.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductsRepository } from "./products.repository";
import { Sort } from "./types/sort";

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(products: CreateProductDto[]): Promise<void> {
    const bulkDocs = [];

    products.forEach(({ price, ...rest }) => {
      const bulkDoc = {
        updateOne: {
          filter: { slug: rest.slug },
          update: {
            $setOnInsert: rest,
            $addToSet: { prices: price },
          },
          upsert: true,
        },
      };

      bulkDocs.push(bulkDoc);
    });

    await this.productsRepository.create(bulkDocs);
  }

  async getBySlugs(slugs: string[]): Promise<Pick<Product, "_id" | "category" | "slug">[]> {
    return this.productsRepository.findBySlugs(slugs);
  }

  async get(page: number, sort: Sort, city?: string): Promise<any> {
    const res = await this.productsRepository.findAll(page, sort, city);
    return res[0];
  }
}

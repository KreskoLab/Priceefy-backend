import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Product } from "./schemas/products.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductsRepository } from "./products.repository";
import { Sort } from "./types/sort";
import { AggregationResults } from "./interfaces/aggregation-results.interface";
import { Period } from "./types/period";
import { Price } from "./interfaces/price.interface";
import { UtilsService } from "@app/utils";
import { LocalStore } from "@app/stores";

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository, private readonly utilsService: UtilsService) {}

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

  async getAll(page: number, sort: Sort, city?: string): Promise<AggregationResults> {
    const res = await this.productsRepository.findAll(page, sort, city);
    return res[0];
  }

  async getBySlug(slug: string, city?: string): Promise<Product> {
    const res = await this.productsRepository.findBySlug(slug, city);
    if (res.length) return res[0];
    else throw new HttpException("Product not found", HttpStatus.NOT_FOUND);
  }

  async getByIds(ids: string[], city: string): Promise<Product[]> {
    return this.productsRepository.aggregateByIds(ids, city);
  }

  async getPrices(
    slug: string,
    city: string,
    period: Period,
  ): Promise<Pick<Price, "price" | "store" | "created_at">[]> {
    const stores = await this.utilsService
      .readData<LocalStore[]>("stores.json")
      .then((res) => res.map((store) => ({ name: store.name, slug: store.slug })));
    const res = await this.productsRepository.aggregatePrices(slug, city, period);

    return res.map((item) => ({ ...item, store: stores.find((store) => store.slug === item.store).name }));
  }
}

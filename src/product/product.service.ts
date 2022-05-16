import { Injectable } from "@nestjs/common";
import { Product } from "./schemas/product.schema";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductRepository } from "./product.repository";

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(products: CreateProductDto[]): Promise<void> {
    const bulkDocs = [];

    products.forEach(({ price, ...rest }) => {
      const bulkDoc = {
        updateOne: {
          filter: { slug: rest.slug, weight: rest.weight, unit: rest.unit },
          update: {
            $setOnInsert: rest,
            $addToSet: { prices: price._id },
          },
          upsert: true,
        },
      };

      bulkDocs.push(bulkDoc);
    });

    // for (const product of products) {
    //   const bulkDoc = {
    //     updateOne: {
    //       filter: { slug: product.slug, weight: product.weight, unit: product.unit },
    //       update: {
    //         $setOnInsert: product,
    //         $addToSet: { prices: product.price._id },
    //       },
    //       upsert: true,
    //     },
    //   };

    //   bulkDocs.push(bulkDoc);
    // }

    await this.productRepository.create(bulkDocs);
  }

  async findManyIds(slugs: string[]): Promise<Product[]> {
    return this.productRepository.findProductsCategoriesIdsInArray(slugs);
  }
}

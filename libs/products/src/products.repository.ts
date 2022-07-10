import { Injectable } from "@nestjs/common";
import { Product } from "./schemas/products.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Sort } from "./types/sort";
import { AggregationResults } from "./interfaces/aggregation-results.interface";

@Injectable()
export class ProductsRepository {
  constructor(@InjectModel("Product") private model: Model<Product>) {}

  async create(products: object[]): Promise<void> {
    await this.model.bulkWrite(products);
  }

  async findBySlugs(slugs: string[]): Promise<Pick<Product, "_id" | "category" | "slug">[]> {
    return this.model.find({ slug: { $in: slugs } }, { _id: 1, category: 1, slug: 1 });
  }

  async findAll(page: number, sort: Sort, city?: string): Promise<AggregationResults[]> {
    const cityMatch = city ? city : { $exists: true };

    let sortCondition = {};

    switch (sort) {
      case "asc":
        sortCondition = { "prices.price": 1 };
        break;

      case "desc":
        sortCondition = { "prices.price": -1 };
        break;

      case "discount":
        sortCondition = { "prices.discount": -1 };
        break;
    }

    return this.model.aggregate([
      {
        $unwind: "$prices",
      },
      {
        $match: {
          "prices.city": cityMatch,
        },
      },
      {
        $sort: { "prices.created_at": -1 },
      },
      {
        $group: {
          _id: { name: "$name", weight: "$weight", unit: "$unit" },
          prices: { $addToSet: "$prices" },
          slug: { $first: "$slug" },
          image: { $first: "$image" },
          country: { $first: "$country" },
          trademark: { $first: "$trademark" },
          unit: { $first: "$unit" },
          weight: { $first: "$weight" },
        },
      },
      {
        $set: {
          name: "$_id.name",
          _id: "$$REMOVE",
        },
      },
      {
        $match: {
          $expr: { $gt: [{ $size: "$prices" }, 0] },
        },
      },
      {
        $sort: sortCondition,
      },
      {
        $facet: {
          results: [
            {
              $skip: 30 * (page - 1),
            },
            {
              $limit: 30,
            },
          ],
          count: [{ $count: "count" }],
        },
      },
      {
        $addFields: {
          count: { $arrayElemAt: ["$count.count", 0] },
        },
      },
    ]);
  }
}

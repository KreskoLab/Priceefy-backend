import { Injectable } from "@nestjs/common";
import { Product } from "./schemas/products.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Sort } from "./types/sort";
import { AggregationResults } from "./interfaces/aggregation-results.interface";
import { Period } from "./types/period";
import { Price } from "./interfaces/price.interface";

@Injectable()
export class ProductsRepository {
  constructor(@InjectModel("Product") private model: Model<Product>) {}

  async create(products: object[]): Promise<void> {
    await this.model.bulkWrite(products);
  }

  async findBySlugs(slugs: string[]): Promise<Pick<Product, "_id" | "category" | "slug">[]> {
    return this.model.find({ slug: { $in: slugs } }, { _id: 1, category: 1, slug: 1 });
  }

  async aggregateByIds(ids: string[], city: string): Promise<Product[]> {
    return this.model.aggregate([
      {
        $match: {
          _id: { $in: ids },
        },
      },
      {
        $unwind: "$prices",
      },
      {
        $match: {
          "prices.city": city,
        },
      },
      {
        $sort: { "prices.created_at": -1 },
      },
      {
        $group: {
          _id: { slug: "$slug", store: "$prices.store", city: "$prices.city" },
          name: { $first: "$name" },
          prices: { $first: "$prices" },
          slug: { $first: "$slug" },
          image: { $first: "$image" },
          country: { $first: "$country" },
          trademark: { $first: "$trademark" },
          unit: { $first: "$unit" },
          weight: { $first: "$weight" },
        },
      },
      {
        $group: {
          _id: { slug: "$_id.slug" },
          name: { $first: "$name" },
          prices: { $push: "$prices" },
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
          _id: "$$REMOVE",
        },
      },
    ]);
  }

  async aggregatePrices(
    slug: string,
    city: string,
    period: Period,
  ): Promise<Pick<Price, "price" | "store" | "created_at">[]> {
    return this.model.aggregate([
      {
        $match: {
          slug: slug,
        },
      },
      {
        $unwind: "$prices",
      },
      {
        $match: {
          "prices.city": city,
        },
      },
      {
        $sort: { "prices.created_at": -1 },
      },
      {
        $group: {
          _id: "$name",
          prices: { $addToSet: "$prices" },
        },
      },
      {
        $project: {
          _id: 0,
          prices: {
            $map: {
              input: {
                $filter: {
                  input: "$prices",
                  as: "price",
                  cond: {
                    $eq: [
                      { $dateTrunc: { date: "$$NOW", unit: period, timezone: "Europe/Kiev" } },
                      { $dateTrunc: { date: "$$price.created_at", unit: period, timezone: "Europe/Kiev" } },
                    ],
                  },
                },
              },
              as: "price",
              in: {
                price: "$$price.price",
                store: "$$price.store",
                created_at: "$$price.created_at",
              },
            },
          },
        },
      },
      {
        $unwind: "$prices",
      },
      {
        $replaceRoot: { newRoot: "$prices" },
      },
    ]);
  }

  async findBySlug(slug: string, city?: string): Promise<Product[]> {
    const cityMatch = city ? city : { $exists: true };

    return this.model.aggregate([
      {
        $match: {
          slug: slug,
        },
      },
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
          _id: { name: "$name", store: "$prices.store", city: "$prices.city" },
          id: { $first: "$_id" },
          prices: { $first: "$prices" },
          slug: { $first: "$slug" },
          image: { $first: "$image" },
          country: { $first: "$country" },
          trademark: { $first: "$trademark" },
          unit: { $first: "$unit" },
          weight: { $first: "$weight" },
        },
      },
      {
        $group: {
          _id: { name: "$_id.name" },
          id: { $first: "$id" },
          prices: { $push: "$prices" },
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
          _id: "$id",
          id: "$$REMOVE",
        },
      },
    ]);
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
          _id: { name: "$name", store: "$prices.store", city: "$prices.city", weight: "$weight", unit: "$unit" },
          prices: { $first: "$prices" },
          slug: { $first: "$slug" },
          image: { $first: "$image" },
          country: { $first: "$country" },
          trademark: { $first: "$trademark" },
          unit: { $first: "$unit" },
          weight: { $first: "$weight" },
        },
      },
      {
        $group: {
          _id: { name: "$_id.name", weight: "$_id.weight", unit: "$_id.unit" },
          prices: { $push: "$prices" },
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

  async searchAggregation(query: string): Promise<{ ids: string[] }[]> {
    return this.model.aggregate([
      {
        $match: {
          $text: {
            $search: query,
          },
        },
      },
      {
        $project: {
          slug: 1,
          score: { $meta: "textScore" },
        },
      },
      {
        $match: {
          score: {
            $gt: 0.7,
          },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
      {
        $group: {
          _id: 1,
          ids: { $push: "$_id" },
        },
      },
    ]);
  }
}

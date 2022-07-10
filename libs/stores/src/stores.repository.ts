import { AggregationResults, Sort } from "@app/products";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateStoreDto } from "./dto/create-store.dto";
import { Store } from "./schemas/store.schema";

@Injectable()
export class StoresRepository {
  constructor(@InjectModel(Store.name) private readonly model: Model<Store>) {}

  async create(store: CreateStoreDto): Promise<Store> {
    return this.model.create(store);
  }

  async bulkWrite(bulkDocs: object[]): Promise<void> {
    await this.model.bulkWrite(bulkDocs);
  }

  async aggregateProducts(slug: string, page: number, sort: Sort, city?: string): Promise<AggregationResults[]> {
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
        $match: {
          slug: slug,
        },
      },
      {
        $lookup: {
          from: "products",
          foreignField: "_id",
          localField: "products",
          pipeline: [
            {
              $unwind: "$prices",
            },
            {
              $match: {
                "prices.store": slug,
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
          ],
          as: "products",
        },
      },
      {
        $unwind: "$products",
      },
      {
        $replaceRoot: { newRoot: "$products" },
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

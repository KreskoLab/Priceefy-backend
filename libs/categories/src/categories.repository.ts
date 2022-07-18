import { Category } from "./schemas/category.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { AggregationResults, Sort } from "@app/products";

@Injectable()
export class CategoriesRepository {
  constructor(@InjectModel(Category.name) private readonly model: Model<Category>) {}

  async create(category: CreateCategoryDto): Promise<Category> {
    return this.model.create(category);
  }

  async getOneBySlug(slug: string): Promise<Category> {
    return this.model.findOne({ slug: slug });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.model.find({ products: { $exists: true, $not: { $size: 0 } } });
  }

  async getAllIdsAndSlugs(): Promise<Category[]> {
    return this.model.find({}, { _id: 1, slug: 1 });
  }

  async updateCategoryProducts(bulkDocs: object[]): Promise<void> {
    await this.model.bulkWrite(bulkDocs);
  }

  async getProducts(
    slug: string,
    page: number,
    sort: Sort,
    store?: string,
    city?: string,
  ): Promise<AggregationResults[]> {
    const storeMatch = store ? store : { $exists: true };
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
                "prices.store": storeMatch,
                "prices.city": cityMatch,
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

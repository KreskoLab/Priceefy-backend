import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Price, PriceDocument } from "./schemas/price.schema";
import { CreatePriceDto } from "./dto/create-price.dto";

@Injectable()
export class PriceService {
  constructor(@InjectModel(Price.name) private priceModel: Model<PriceDocument>) {}

  async create(prices: Array<CreatePriceDto>) {
    const bulkDocs = [];

    prices.forEach((price) => {
      const bulkDoc = {
        updateOne: {
          filter: {
            product: price.product,
            store: price.store,
            city: price.city,
            createdAt: price.createdAt,
          },
          update: price,
          upsert: true,
        },
      };
      bulkDocs.push(bulkDoc);
    });

    await this.priceModel.bulkWrite(bulkDocs);
  }

  async findManyIds(stores: string[], cities: string[], createdAt: number[], products: string[]): Promise<Price[]> {
    return this.priceModel.find(
      {
        store: { $in: stores },
        city: { $in: cities },
        createdAt: { $in: createdAt },
        product: { $in: products },
      },
      { _id: 1, product: 1 },
    );
  }
}

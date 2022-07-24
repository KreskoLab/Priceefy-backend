import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { Price } from "../interfaces/price.interface";
import ObjectId = mongoose.Schema.Types.ObjectId;

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  _id: string;

  @Prop({ required: true, index: "text" })
  name: string;

  @Prop({ required: true, index: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ required: true })
  image: string;

  @Prop({ type: ObjectId, ref: "Category" })
  category: string;

  @Prop({ type: [Object] })
  prices: Price[];

  @Prop()
  weight: number;

  @Prop()
  unit: string;

  @Prop()
  trademark: string;

  @Prop()
  country: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ "prices.discount": 1 });
ProductSchema.index({ "prices.price": 1 });

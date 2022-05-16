import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import ObjectId = mongoose.Schema.Types.ObjectId;
import { Category } from "../../category/schemas/category.schema";
import { Price } from "../../price/schemas/price.schema";

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop()
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ required: true, unique: false, default: "" })
  image: string;

  @Prop({ type: ObjectId, ref: "Category" })
  category: Category;

  @Prop({ type: [{ type: ObjectId, ref: "Price" }] })
  prices: Price[];

  @Prop({ default: 0 })
  weight: number;

  @Prop({ default: "" })
  unit: string;

  @Prop({ default: "" })
  trademark: string;

  @Prop({ default: "" })
  country: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

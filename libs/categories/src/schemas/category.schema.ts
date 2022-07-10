import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Product } from "@app/products";
import mongoose, { Document } from "mongoose";
import ObjectId = mongoose.Schema.Types.ObjectId;

export type CategoryDocument = Category & Document;

@Schema({ versionKey: false })
export class Category {
  _id: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ type: [{ type: ObjectId, ref: "Product" }] })
  products: Product[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

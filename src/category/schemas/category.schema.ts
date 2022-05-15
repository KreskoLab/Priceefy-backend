import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import ObjectId = mongoose.Schema.Types.ObjectId;
import { Product } from "../../product/schemas/product.schema";

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ type: mongoose.Types.ObjectId })
  _id: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ default: "" })
  icon: string;

  @Prop({ type: [{ type: ObjectId, ref: "Product" }] })
  products: Product[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);

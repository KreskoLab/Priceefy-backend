import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Product } from "@app/products";
import mongoose, { Document } from "mongoose";
import ObjectId = mongoose.Schema.Types.ObjectId;

export type StoreDocument = Store & Document;

@Schema({ versionKey: false })
export class Store {
  _id: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ type: [{ type: ObjectId, ref: "Product" }] })
  products: Product[];
}

export const StoreSchema = SchemaFactory.createForClass(Store);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type PriceDocument = Price & Document;

@Schema()
export class Price {
  @Prop({ required: true, lowercase: true })
  product: string;

  @Prop({ required: true, index: true })
  store: string;

  @Prop({ required: true, index: true })
  city: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  discount: boolean;

  @Prop()
  discount_price: number;

  @Prop()
  discount_end: Date;

  @Prop()
  createdAt: number;

  @Prop()
  _id: string;
}

export const PriceSchema = SchemaFactory.createForClass(Price);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema()
export class User {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  googleId: string;

  @Prop({ required: true })
  avatar: string;

  @Prop({ default: false })
  admin: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }] })
  favorites: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

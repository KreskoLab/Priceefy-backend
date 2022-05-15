import mongoose from "mongoose";

export interface TargetInterface {
  query: string;
  page: number;
  categoryId: string;
  storeCityId: string;
  city: string;
  category: mongoose.Types.ObjectId;
  store: string;
}

import { LocalCategory } from "@app/categories";

export interface ScannerCategory extends Omit<LocalCategory, "icon"> {
  _id: string;
}

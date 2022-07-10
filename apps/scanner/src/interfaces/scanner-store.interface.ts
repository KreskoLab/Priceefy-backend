import { LocalStore } from "@app/stores";

export interface ScannerStore {
  name: string;
  slug: string;
  cities: LocalStore["cities"];
}

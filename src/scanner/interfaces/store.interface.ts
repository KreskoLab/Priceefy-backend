export interface StoreInterface {
  name: string;
  slug: string;
  cities: Array<StoreCityInterface>;
}

export interface StoreCityInterface {
  name: string;
  slug: string;
  id: string;
}

export interface CategoryInterface {
  _id?: any;
  name: string;
  slug: string;
  stores: Array<CategoryStoreInterface>;
}

export interface CategoryStoreInterface {
  slug: string;
  id: string;
}

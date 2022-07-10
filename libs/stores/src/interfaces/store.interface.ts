export interface City {
  id: string;
  slug: string;
  name: string;
}

export interface LocalStore {
  name: string;
  slug: string;
  icon: string;
  cities: Partial<City>[];
}

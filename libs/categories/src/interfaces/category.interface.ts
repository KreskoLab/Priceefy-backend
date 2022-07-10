interface Store {
  id: string;
  slug: string;
  tm?: string | string[];
}

export interface LocalCategory {
  name: string;
  slug: string;
  icon: string;
  stores: Store[];
}

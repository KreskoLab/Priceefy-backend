import { Injectable } from "@nestjs/common";
import { Store } from "./schemas/store.schema";
import { LocalStore } from "./interfaces/store.interface";
import { CreateStoreDto } from "./dto/create-store.dto";
import { StoresRepository } from "./stores.repository";
import { ProductsResponse, Sort } from "@app/products";
import { UtilsService } from "@app/utils";
import { City } from "./interfaces/store.interface";

@Injectable()
export class StoresService {
  constructor(private readonly storesRepository: StoresRepository, private readonly utilsService: UtilsService) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    return this.storesRepository.create(dto);
  }

  async getStores(): Promise<Partial<LocalStore>[]> {
    const res = await this.utilsService.readData<LocalStore[]>("stores.json");
    return res.map(({ cities, ...rest }) => {
      return {
        ...rest,
        cities: cities.map((city) => ({ name: city.name, slug: city.slug })),
      };
    });
  }

  async getCities(): Promise<Pick<City, "name" | "slug">[]> {
    const stores = await this.utilsService.readData<LocalStore[]>("stores.json");
    return stores[0].cities.map((city) => ({ name: city.name, slug: city.slug }));
  }

  async getProducts(slug: string, page: number, sort: Sort, city?: string): Promise<any> {
    const res = await this.storesRepository.getProducts(slug, page, sort, city);
    return res[0];
  }

  async updateProducts(products: Pick<ProductsResponse, "stores">): Promise<void> {
    const bulkDocs = [];

    products.stores.forEach((item) => {
      const bulkDoc = {
        updateOne: {
          filter: { slug: item.slug },
          update: {
            $addToSet: { products: item.products },
          },
        },
      };
      bulkDocs.push(bulkDoc);
    });

    await this.storesRepository.bulkWrite(bulkDocs);
  }
}

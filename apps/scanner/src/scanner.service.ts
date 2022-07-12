import { Injectable } from "@nestjs/common";
import { ScannerCategory } from "./interfaces/scanner-category.interface";
import { Target } from "./interfaces/target.interface";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { UtilsService } from "@app/utils";
import { ProductsService } from "@app/products";
import { CategoriesService } from "@app/categories";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { ProductsAndCount } from "./interfaces/products-count.interface";
import { SilpoResponse } from "./interfaces/silpo-response.interface";
import { CreateProductDto } from "@app/products";
import { ZakazResponse } from "./interfaces/zakaz-response.interface";
import { ProductsResponse } from "@app/products";
import { DateTime } from "luxon";
import { CATEGORIES } from "@app/categories";
import { ScannerStore } from "./interfaces/scanner-store.interface";

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

@Injectable()
export class ScannerService {
  constructor(
    private httpService: HttpService,
    private utilsService: UtilsService,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    @InjectQueue("scanner") private scannerQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.load();
  }

  async load(): Promise<void> {
    const stores = await this.utilsService.readData<ScannerStore[]>("stores.json");
    const categories = await this.utilsService.readData<ScannerCategory[]>("categories.json");
    const categoriesIds = await this.categoriesService.getIds();

    categories.forEach((category, index, arr) => {
      arr[index]._id = categoriesIds.find((item) => item.slug === category.slug)._id;
    });

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      for (let j = 0; j < category.stores.length; j++) {
        const categoryStore = category.stores[j];
        const store = stores.find((item) => item.slug === categoryStore.slug);

        for (let k = 0; k < store.cities.length; k++) {
          const city = store.cities[k];

          const target: Target = {
            query: "?page=",
            page: 1,
            category: category._id,
            categorySlug: category.slug,
            city: city.slug,
            store: store.slug,
            categoryId: categoryStore.id,
            storeCityId: city.id,
          };

          if (categoryStore.tm) {
            target.tm = categoryStore.tm;
          }

          await this.scannerQueue.add("scan", target, { attempts: 2, removeOnComplete: true });
        }
      }
    }
  }

  async scanSilpo(url: string, target: Target, baseCount: number): Promise<ProductsAndCount> {
    const end = baseCount * target.page;
    const start = end - baseCount + 1;

    const res = await firstValueFrom(
      this.httpService.post<SilpoResponse>(
        url,
        {
          method: "GetSimpleCatalogItems",
          data: {
            categoryId: target.categoryId,
            filialId: target.storeCityId,
            From: start,
            To: end,
            MultiFilters: {
              "100": target.tm ? target.tm : [],
            },
          },
        },
        {
          headers: { "Accept-Language": "uk" },
        },
      ),
    );

    const count = res.data.itemsCount;
    const products: CreateProductDto[] = [];

    for (const item of res.data.items) {
      const { price, weight, unit } = this.utilsService.handleSilpoWeightAndPrice(
        item.price,
        item.unit,
        target.categorySlug as `${CATEGORIES}`,
      );

      const newProduct = {
        name: this.utilsService.normalizeName(item.name, target.categorySlug as `${CATEGORIES}`),
        slug: this.utilsService.slugify(item.name + "-" + weight + unit).toLowerCase(),
        trademark: item.parameters?.find((item) => item.key === "trademark")?.value.trim() || "",
        country: item.parameters?.find((item) => item.key === "country")?.value.trim() || "без тм",
        category: target.category,
        image: item.mainImage,
        unit: unit,
        weight: weight,
        price: {
          price: price,
          discount: !!item.priceStopAfter,
          city: target.city,
          store: target.store,
          created_at: DateTime.now().setZone("Europe/Kiev").endOf("day").toUTC().toString(),
          in_stock: item.quantity > 0 ? true : false,
        },
      } as CreateProductDto;

      if (!!item.priceStopAfter) {
        const date = this.utilsService.handleDiscountDate(item.priceStopAfter, target.store);
        newProduct.price.discount_end = DateTime.fromISO(date, { zone: "Europe/Kiev" }).toUTC().toString();
      }

      products.push(newProduct);
    }

    return { products, count };
  }

  async scanZakaz(url: string, target: Target): Promise<ProductsAndCount> {
    const tm = target.tm ? target.tm : "";
    const zakazURL = url + target.query + target.page + tm;

    const res = await firstValueFrom(
      this.httpService.get<ZakazResponse>(zakazURL, {
        headers: { "Accept-Language": "uk" },
      }),
    );

    const count = res.data.count;
    const products: CreateProductDto[] = [];

    for (const result of res.data.results) {
      const productName: string = this.utilsService.normalizeName(result.title, target.categorySlug as `${CATEGORIES}`);

      const { weight, unit } = this.utilsService.handleZakazWeight(
        result.unit,
        result.weight,
        result.bundle,
        result.volume,
        result.pack_amount,
        target.categorySlug as `${CATEGORIES}`,
        result.title,
      );

      const productSlug: string = this.utilsService.slugify(productName.toLowerCase() + "-" + weight + unit);

      const productPrice = Number(
        result.price.toString().substring(0, result.price.toString().length - 2) +
          "." +
          result.price.toString().slice(-2),
      );

      const discountPrice = productPrice - (productPrice * Number(result.discount.value)) / 100;

      const newProduct: CreateProductDto = {
        name: productName,
        slug: productSlug,
        image: result.img.s350x350,
        category: target.category,
        price: {
          store: target.store,
          city: target.city,
          price: !result.discount.status ? productPrice : discountPrice,
          discount: result.discount.status,
          created_at: DateTime.now().setZone("Europe/Kiev").endOf("day").toUTC().toString(),
          in_stock: result.in_stock,
        },
        country: result.country?.trim() || "",
        trademark: result.producer?.trademark?.trim() || "без тм",
        weight: weight,
        unit: unit,
      };

      if (newProduct.price.discount) {
        newProduct.price.discount_end = this.utilsService.handleDiscountDate(result.discount.due_date, "zakaz");
      }

      products.push(newProduct);
    }
    return { products, count };
  }

  async handleProducts(products: CreateProductDto[]): Promise<ProductsResponse> {
    await this.productsService.create(products);

    const prices = products.map((product) => ({ price: product.price, product: product.slug }));

    const storesNames = [...new Set(prices.map((item) => item.price.store))];
    const categoriesIds = [...new Set(products.map((product) => product.category))];

    const productsSlugs = products.map((product) => product.slug);

    const addedProducts = await this.productsService.getBySlugs(productsSlugs);
    const addedProductsSlugs = addedProducts.map((item) => item.slug);

    const categories = categoriesIds.map((category) => {
      return {
        id: category,
        products: addedProducts.filter((product) => String(product.category) === category).map((item) => item._id),
      };
    });

    const stores = storesNames.map((store) => {
      return {
        slug: store,
        products: prices
          .filter((item) => addedProductsSlugs.includes(item.product) && item.price.store === store)
          .map((item) => addedProducts.find((added) => added.slug === item.product)._id),
      };
    });

    return { stores, categories };
  }
}

import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CategoryInterface } from "./interfaces/category.interface";
import { StoreInterface } from "./interfaces/store.interface";
import { TargetInterface } from "./interfaces/target.interface";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ProductInterface } from "./interfaces/product.interface";
import { UtilsService } from "../utils/utils.service";
import { ProductService } from "../product/product.service";
import { PriceService } from "../price/price.service";
import { CategoryService } from "../category/category.service";
import { Category } from "../category/schemas/category.schema";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { ProductsAndCountI } from "./interfaces/products-count.interface";

require("dotenv").config();

@Injectable()
export class ScannerService {
  constructor(
    private httpService: HttpService,
    private utilsService: UtilsService,
    private productService: ProductService,
    private priceService: PriceService,
    private categoryService: CategoryService,
    @InjectQueue("scanner") private scannerQueue: Queue,
  ) {}

  @Cron(CronExpression[process.env.CRON_TIME])
  async load(): Promise<void> {
    const storesJSON = "/src/data/stores.json";
    const catagoriesJSON = "/src/data/categories.json";

    const stores: StoreInterface[] = await this.utilsService.readData(storesJSON);
    const categories: CategoryInterface[] = await this.utilsService.readData(catagoriesJSON);

    const categoriesIds: Category[] = await this.categoryService.getIds();

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

          const target: TargetInterface = {
            query: "?page=",
            page: 1,
            category: category._id,
            city: city.slug,
            store: store.slug,
            categoryId: categoryStore.id,
            storeCityId: city.id,
          };

          await this.scannerQueue.add("scan", target, { attempts: 2, removeOnComplete: true });
        }
      }
    }
  }

  async scanSilpo(url: string, target: TargetInterface, baseCount: number): Promise<ProductsAndCountI> {
    const end = baseCount * target.page;
    const start = end - baseCount + 1;

    const res: any = await firstValueFrom(
      this.httpService.post(
        url,
        {
          method: "GetSimpleCatalogItems",
          data: {
            categoryId: target.categoryId,
            filialId: target.storeCityId,
            From: start,
            To: end,
          },
        },
        {
          headers: { "Accept-Language": "uk" },
        },
      ),
    );

    res.data.items = res.data.items.filter((item) => item.storeQuantity === 1);

    const count: number = res.data.itemsCount;
    const products: Array<ProductInterface> = [];

    for (const item of res.data.items) {
      const productName: string = this.utilsService.normalizeName(item.name);

      const { weight, unit } = this.utilsService.handleWeightAndUnit(
        parseFloat(item.unit.replace(",", ".").replace(/[^0-9.]/g, "")),
        item.unit.replace(",", "").replace(/[0-9]/g, ""),
        target.categoryId,
      );

      const productSlug = this.utilsService.slugify(productName.toLowerCase() + "-" + weight + unit);
      const productCountry =
        item.parameters && item.parameters["country"] ? item.parameters["country"].value.toLowerCase() : "";
      const productTM = item.parameters && item.parameters["trademark"] ? item.parameters["trademark"].value : "без тм";
      const productPrice =
        (target.categoryId === "378" || target.categoryId === "381") && unit === "kg" ? item.price * 10 : item.price;

      const product: ProductInterface = {
        name: productName,
        slug: productSlug,
        image: await this.utilsService.saveImage(item.mainImage, productSlug),
        category: target.category,
        price: {
          product: productSlug,
          store: target.store,
          city: target.city,
          price: productPrice,
          discount: !!item.priceStopAfter,
          discount_price: productPrice,
          discount_end: item.priceStopAfter
            ? this.utilsService.handleDiscountDate(item.priceStopAfter, target.store)
            : new Date(),
          createdAt: new Date().setHours(0, 0, 0, 0),
        },
        weight: weight,
        unit: unit,
        country: productCountry,
        trademark: productTM,
      };

      products.push(product);
    }

    return { products, count };
  }

  async scanZakaz(url: string, target: TargetInterface): Promise<ProductsAndCountI> {
    const res = await firstValueFrom(
      this.httpService.get(url + target.query + target.page, {
        headers: { "Accept-Language": "uk" },
      }),
    );

    const count: number = res.data.count;
    const products: Array<ProductInterface> = [];

    for (const result of res.data.results) {
      const productName: string = this.utilsService.normalizeName(result.title);

      let weight: number;
      let unit: string;

      if (result.volume) {
        if (result.pack_amount && result.unit === "pcs") {
          ({ weight, unit } = this.utilsService.handleWeightAndUnit(result.pack_amount, result.unit));
        } else ({ weight, unit } = this.utilsService.handleWeightAndUnit(result.volume, "мл"));
      } else {
        if (result.pack_amount && result.unit === "pcs") {
          ({ weight, unit } = this.utilsService.handleWeightAndUnit(result.pack_amount, result.unit));
        } else
          ({ weight, unit } = this.utilsService.handleWeightAndUnit(
            result.weight === 0 ? result.bundle : result.weight,
            result.unit,
          ));
      }

      const productSlug: string = this.utilsService.slugify(productName.toLowerCase() + "-" + weight + unit);
      const productPrice = Number(
        result.price.toString().substring(0, result.price.toString().length - 2) +
          "." +
          result.price.toString().slice(-2),
      );

      const product: ProductInterface = {
        name: productName,
        slug: productSlug,
        image: await this.utilsService.saveImage(result.img.s350x350, productSlug),
        category: target.category,
        price: {
          product: productSlug,
          store: target.store,
          city: target.city,
          price: productPrice,
          discount: result.discount.status,
          discount_price: productPrice - (productPrice * Number(result.discount.value)) / 100,
          discount_end: result.discount.status
            ? this.utilsService.handleDiscountDate(result.discount.due_date, target.store)
            : new Date(),
          createdAt: new Date().setHours(0, 0, 0, 0),
        },
        country: result.country !== null ? result.country : "",
        trademark: result.producer.trademark || "без тм",
        weight: weight,
        unit: unit,
      };

      products.push(product);
    }
    return { products, count };
  }

  async handleProducts(products: ProductInterface[]): Promise<string[]> {
    const prices = products.map((product) => product.price);

    await this.priceService.create(prices);

    const stores = [...new Set<string>(prices.map((price) => price.store))];
    const cities = [...new Set<string>(prices.map((price) => price.city))];
    const createAt = [...new Set<number>(prices.map((price) => price.createdAt))];
    const priceProducts = prices.map((price) => price.product);

    await this.priceService.findManyIds(stores, cities, createAt, priceProducts).then((ids) => {
      products.forEach((product, index, arr) => {
        arr[index].price._id = ids.find((id) => id.product === product.slug)._id;
      });
    });

    await this.productService.create(products);

    const productsSlugs = products.map((product) => product.slug);
    let productsIds = [];

    await this.productService.findManyIds(productsSlugs).then((res) => {
      productsIds = res.reduce((arr: any, cv) => {
        if (arr.every((item) => item.category.toString() !== cv.category.toString())) {
          arr.push({ category: cv.category, products: [cv._id] });
        } else {
          const item = arr.find((element) => element.category.toString() === cv.category.toString());
          item.products.push(cv._id);
        }
        return arr;
      }, []);
    });

    return productsIds.flat();
  }
}

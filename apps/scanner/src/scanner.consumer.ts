import { OnQueueActive, OnQueueCompleted, OnQueueError, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { CategoriesService } from "@app/categories";
import { CreateProductDto } from "@app/products";
import { StoresService } from "@app/stores";
import { ProductsAndCount } from "./interfaces/products-count.interface";
import { Target } from "./interfaces/target.interface";
import { ScannerService } from "./scanner.service";

@Processor("scanner")
export class ScannerConsumer {
  constructor(
    private readonly scannerService: ScannerService,
    private readonly categoriesService: CategoriesService,
    private readonly storesService: StoresService,
  ) {}

  @Process("scan")
  async handleScanTarget(job: Job<Target>): Promise<void> {
    const zakazAPI = "https://stores-api.zakaz.ua";
    const silpoAPI = "https://api.catalog.ecom.silpo.ua/api/2.0/exec/EcomCatalogGlobal";

    const baseCount = 30;
    const products: CreateProductDto[] = [];

    let res: ProductsAndCount;
    let pages = 0;

    switch (job.data.store) {
      case "silpo":
        res = await this.scannerService.scanSilpo(silpoAPI, job.data, baseCount);
        pages = Math.ceil(res.count / baseCount);

        for (let i = 1; i < pages + 1; i++) {
          job.data.page = i;

          const response = await this.scannerService.scanSilpo(silpoAPI, job.data, baseCount);
          products.push(...response.products);
        }

        break;

      default:
        const url = `${zakazAPI}/stores/${job.data.storeCityId}/categories/${job.data.categoryId}/products`;

        res = await this.scannerService.scanZakaz(url, job.data);
        pages = Math.ceil(res.count / baseCount);

        for (let i = 1; i < pages + 1; i++) {
          job.data.page = i;

          const response = await this.scannerService.scanZakaz(url, job.data);
          products.push(...response.products);
        }

        break;
    }

    const handledProducts = await this.scannerService.handleProducts(products);

    try {
      await this.categoriesService.updateProducts(handledProducts);
      await this.storesService.updateProducts(handledProducts);

      await job.progress(100);
    } catch (error) {
      await job.retry();
    }
  }

  @OnQueueActive()
  onActive(job: Job<Target>) {
    console.log(
      `Processing job ${job.id} with data ${job.data.categorySlug} ${job.data.city} ${job.data.store} ${job.data.tm}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job<Target>) {
    console.log(`Complete job ${job.id} with data ${job.data.categorySlug} ${job.data.city} ${job.data.store}!`);
  }

  @OnQueueError()
  onError(err: Error) {
    console.log(`Cerror ${err}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<Target>, err: Error) {
    console.log(`failed ${err}`);
  }
}

import { OnQueueActive, OnQueueCompleted, OnQueueError, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { CategoryService } from "src/category/category.service";
import { ProductInterface } from "./interfaces/product.interface";
import { TargetInterface } from "./interfaces/target.interface";
import { ScannerService } from "./scanner.service";

@Processor("scanner")
export class ScannerConsumer {
  constructor(private scannerService: ScannerService, private categoryService: CategoryService) {}

  @Process("scan")
  async handleScanTarget(job: Job<TargetInterface>): Promise<void> {
    const zakazAPI = "https://stores-api.zakaz.ua";
    const silpoAPI = "https://api.catalog.ecom.silpo.ua/api/2.0/exec/EcomCatalogGlobal";

    if (job.data.store === "silpo") {
      const baseCount = 30;
      const products: Array<ProductInterface> = [];

      const res = await this.scannerService.scanSilpo(silpoAPI, job.data, baseCount);

      const pages = Math.ceil(res.count / baseCount);

      for (let i = 1; i < pages + 1; i++) {
        job.data.page = i;
        const response = await this.scannerService.scanSilpo(silpoAPI, job.data, baseCount);
        products.push(...response.products);
      }

      const productsIds = await this.scannerService.handleProducts(products);
      const success = await this.categoryService.updateProducts(productsIds);

      if (success) await job.progress(100);
      else await job.retry();
    } else {
      const url = `${zakazAPI}/stores/${job.data.storeCityId}/categories/${job.data.categoryId}/products`;

      const baseCount = 30;
      const products: Array<ProductInterface> = [];

      const res = await this.scannerService.scanZakaz(url, job.data);
      const pages = Math.ceil(res.count / baseCount);

      for (let i = 1; i < pages + 1; i++) {
        job.data.page = i;
        const response = await this.scannerService.scanZakaz(url, job.data);
        products.push(...response.products);
      }

      const productsIds = await this.scannerService.handleProducts(products);
      const success = await this.categoryService.updateProducts(productsIds);

      if (success) await job.progress(100);
      else await job.retry();
    }
  }

  @OnQueueActive()
  onActive(job: Job<TargetInterface>) {
    console.log(`Processing job ${job.id} with data ${job.data.category} ${job.data.city} ${job.data.store}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job<TargetInterface>) {
    console.log(`Complete job ${job.id} with data ${job.data.category} ${job.data.city} ${job.data.store}!`);
  }

  @OnQueueError()
  onError(err: Error) {
    console.log(`Cerror ${err}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<TargetInterface>, err: Error) {
    console.log(`failed ${err}`);
  }
}

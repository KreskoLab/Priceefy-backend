import { Module } from "@nestjs/common";
import { ScannerService } from "./scanner.service";
import { HttpModule } from "@nestjs/axios";
import { UtilsModule } from "../utils/utils.module";
import { ProductModule } from "../product/product.module";
import { PriceModule } from "../price/price.module";
import { CategoryModule } from "../category/category.module";
import { BullModule } from "@nestjs/bull";
import { ScannerConsumer } from "./scanner.consumer";

@Module({
  imports: [
    UtilsModule,
    ProductModule,
    PriceModule,
    CategoryModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 8000,
        maxRedirects: 5,
      }),
    }),
    BullModule.registerQueue({
      name: "scanner",
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
  ],
  providers: [ScannerService, ScannerConsumer],
  controllers: [],
})
export class ScannerModule {}

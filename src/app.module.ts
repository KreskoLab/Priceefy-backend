import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { CategoryModule } from "./category/category.module";
import { PriceModule } from "./price/price.module";
import { ProductModule } from "./product/product.module";
import { ScannerModule } from "./scanner/scaner.module";
import { BullModule } from "@nestjs/bull";
import mainConfig from "./config/main.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mainConfig],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get("main.redisHost"),
          port: configService.get("main.redisPort"),
          password: configService.get("main.redisPassword"),
        },
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get("main.dbLink"),
        dbName: configService.get("main.dbName"),
      }),
    }),
    ScheduleModule.forRoot(),
    CategoryModule,
    ProductModule,
    PriceModule,
    ScannerModule,
  ],
})
export class AppModule {}

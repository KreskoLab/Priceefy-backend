import { Module } from "@nestjs/common";
import { ScannerService } from "./scanner.service";
import { HttpModule } from "@nestjs/axios";
import { UtilsModule } from "@app/utils";
import { ProductsModule } from "@app/products";
import { CategoriesModule } from "@app/categories";
import { BullModule } from "@nestjs/bull";
import { ScannerConsumer } from "./scanner.consumer";
import { StoresModule } from "@app/stores";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "./apps/scanner/.env",
    }),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 8000,
        maxRedirects: 5,
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get("DB_LINK"),
        dbName: configService.get("DB_DATABASE"),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get("REDIS_HOST"),
          port: configService.get("REDIS_PORT"),
          password: configService.get("REDIS_PASSWORD"),
        },
      }),
    }),
    BullModule.registerQueue({
      name: "scanner",
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    StoresModule,
    CategoriesModule,
    ProductsModule,
    UtilsModule,
  ],
  providers: [ScannerService, ScannerConsumer],
})
export class ScannerModule {}

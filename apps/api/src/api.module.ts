import { CategoriesModule } from "@app/categories";
import { StoresModule } from "@app/stores";
import { ProductsModule } from "@app/products";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ApiController } from "./api.controller";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "./apps/api/.env",
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get("DB_LINK"),
        dbName: configService.get("DB_DATABASE"),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join("./dist/", "icons"),
      serveRoot: "/icons/",
    }),
    StoresModule,
    CategoriesModule,
    ProductsModule,
  ],
  controllers: [ApiController],
})
export class ApiModule {}

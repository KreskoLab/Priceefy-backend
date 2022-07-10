import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./schemas/products.schema";
import { ProductsRepository } from "./products.repository";

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}

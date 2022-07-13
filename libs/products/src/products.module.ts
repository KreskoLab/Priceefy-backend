import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Product, ProductSchema } from "./schemas/products.schema";
import { ProductsRepository } from "./products.repository";
import { UtilsModule } from "@app/utils";

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]), UtilsModule],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}

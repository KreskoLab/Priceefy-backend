import { CategoryRepository } from "./category.repository";
import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./schemas/category.schema";
import { UtilsModule } from "../utils/utils.module";

@Module({
  imports: [UtilsModule, MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  exports: [CategoryService],
  providers: [CategoryService, CategoryRepository],
})
export class CategoryModule {}

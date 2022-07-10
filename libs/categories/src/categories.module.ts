import { CategoriesRepository } from "./categories.repository";
import { Module } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./schemas/category.schema";
import { UtilsModule } from "@app/utils";

@Module({
  imports: [UtilsModule, MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService],
})
export class CategoriesModule {}

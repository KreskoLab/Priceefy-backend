import { CategoriesService, Category } from "@app/categories";
import { CreateCategoryDto } from "@app/categories/dto/create-category.dto";
import { AggregationResults, ProductsService, Sort } from "@app/products";
import { StoresService } from "@app/stores";
import { City, LocalStore } from "@app/stores";
import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";

@Controller()
export class ApiController {
  constructor(
    private readonly storesService: StoresService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  @Get("stores")
  async getStores(): Promise<Partial<LocalStore>[]> {
    return this.storesService.getStores();
  }

  @Get("categories")
  async getCategories(): Promise<Partial<LocalStore>[]> {
    return this.categoriesService.getCategories();
  }

  @Get("cities")
  async getCities(): Promise<Pick<City, "name" | "slug">[]> {
    return this.storesService.getCities();
  }

  @Get("products")
  async getProducts(
    @Query("page") page = 1,
    @Query("sort") sort: Sort = "discount",
    @Query("city") city: string,
  ): Promise<AggregationResults> {
    return this.productsService.get(page, sort, city);
  }

  @Get("categories/:slug")
  async getCategoryProducts(
    @Param("slug") slug: string,
    @Query("page") page = 1,
    @Query("sort") sort: Sort = "discount",
    @Query("store") store: string,
    @Query("city") city: string,
  ): Promise<AggregationResults> {
    return this.categoriesService.getProducts(slug, page, sort, store, city);
  }

  @Get("stores/:slug")
  async getStoresProducts(
    @Param("slug") slug: string,
    @Query("page") page = 1,
    @Query("sort") sort: Sort = "discount",
    @Query("city") city: string,
  ): Promise<AggregationResults> {
    return this.storesService.getProducts(slug, page, sort, city);
  }

  @Post("categories")
  async createCategory(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }
}

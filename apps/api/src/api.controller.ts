import { CategoriesService, Category } from "@app/categories";
import { CreateCategoryDto } from "@app/categories/dto/create-category.dto";
import { AggregationResults, ProductsService, Sort } from "@app/products";
import { StoresService } from "@app/stores";
import { City, LocalStore } from "@app/stores";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { AuthService } from "./auth/auth.service";
import { CreateUserDto } from "./users/dto/create-user.dto";
import { User } from "./users/schemas/user";

@Controller()
export class ApiController {
  constructor(
    private readonly storesService: StoresService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
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

  @UseGuards(AuthGuard("google"))
  @Get("login")
  async login() {}

  @Get("me")
  async getUserData(@Req() req: Request): Promise<User> {
    if (req.headers["authorization"]) {
      const accessToken = req.headers["authorization"].replace("Bearer", "");
      return this.authService.validate(accessToken);
    } else throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
  }

  @UseGuards(AuthGuard("google"))
  @Get("auth/google/redirect")
  async signInWithGoogleRedirect(@Req() req: Request) {
    return this.authService.login(req.user as CreateUserDto);
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

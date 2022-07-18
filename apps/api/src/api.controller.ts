import { CategoriesService, Category, LocalCategory } from "@app/categories";
import { CreateCategoryDto } from "@app/categories/dto/create-category.dto";
import { AggregationResults, Price, Product, ProductsService, Sort } from "@app/products";
import { Period } from "@app/products/types/period";
import { StoresService } from "@app/stores";
import { City, LocalStore } from "@app/stores";
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { AuthService } from "./auth/auth.service";
import { UserGuard } from "./auth/guards/user.guard";
import { AdminGuard } from "./auth/guards/admin.guard";
import { CreateUserDto } from "./users/dto/create-user.dto";
import { User } from "./users/schemas/user";
import { UsersService } from "./users/users.service";

@Controller()
export class ApiController {
  constructor(
    private readonly storesService: StoresService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Get("stores")
  async getStores(): Promise<Partial<LocalStore>[]> {
    return this.storesService.getStores();
  }

  @Get("categories")
  async getCategories(): Promise<Partial<LocalCategory>[]> {
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
    if (req.headers["cookie"]) {
      const token = req.headers["cookie"]
        .split(";")
        .find((item) => item.includes("accessToken"))
        .replace("accessToken=", "")
        .trim();

      const valid = await this.authService.validate(token);

      if (valid) {
        const userId = this.authService.decode(token);
        return this.usersService.getUserById(userId);
      } else throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    } else throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
  }

  @UseGuards(AuthGuard("google"))
  @Get("auth/google/redirect")
  async signInWithGoogleRedirect(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.login(req.user as CreateUserDto);

    res.cookie("accessToken", token, {
      domain: this.configService.get<string>("FRONTEND_DOMAIN"),
      maxAge: this.configService.get<number>("COOKIE_LIFETIME"),
      sameSite: "strict",
      httpOnly: true,
    });

    return res.redirect(this.configService.get<string>("FRONTEND_URL"));
  }

  @Get("products")
  async getProducts(
    @Query("page") page = 1,
    @Query("sort") sort: Sort = "discount",
    @Query("city") city: string,
  ): Promise<AggregationResults> {
    return this.productsService.getAll(page, sort, city);
  }

  @Get("products/search")
  async searchProducts(@Query("q") query: string, @Query("city") city: string): Promise<Product[]> {
    return this.productsService.search(query, city);
  }

  @Get("products/:slug")
  async getProduct(@Param("slug") slug: string, @Query("city") city: string): Promise<Product> {
    return this.productsService.getBySlug(slug, city);
  }

  @Get("products/:slug/prices")
  async getProductPrices(
    @Param("slug") slug: string,
    @Query("city") city: string,
    @Query("period") period: Period = "week",
  ): Promise<Pick<Price, "price" | "store" | "created_at">[]> {
    return this.productsService.getPrices(slug, city, period);
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

  @UseGuards(AdminGuard)
  @Post("categories")
  async createCategory(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }

  @UseGuards(UserGuard)
  @Put("users/:id/favorites")
  async updateFavorites(@Body() body: { product: string }, @Param("id") id: string): Promise<User["favorites"]> {
    return this.usersService.handleFavorite(id, body.product);
  }

  @UseGuards(UserGuard)
  @Get("users/:id/favorites")
  async favorites(@Param("id") id: string, @Query("city") city: string): Promise<Product[]> {
    const ids = await this.usersService.getFavorites(id);
    return this.productsService.getByIds(ids, city);
  }
}

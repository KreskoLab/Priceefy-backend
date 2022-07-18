import { CategoriesService, LocalCategory } from "@app/categories";
import { ProductsService } from "@app/products";
import { City, LocalStore, StoresService } from "@app/stores";
import { HttpException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { Request } from "express";
import { ApiController } from "../src/api.controller";
import { AuthService } from "../src/auth/auth.service";
import { User } from "../src/users/schemas/user";
import { UsersService } from "../src/users/users.service";
import { localCategoryStub } from "./stubs/local-category.stub";
import { localStoreStub } from "./stubs/local-store.stub";
import { requestStub } from "./stubs/request.stub";
import { tokenStub } from "./stubs/token.stub";
import { userStub } from "./stubs/user.stub";
import { MockAuthService } from "./__mocks__/auth.service.mock";
import { MockCategoriesService } from "./__mocks__/categories.service.mock";
import { MockProductsService } from "./__mocks__/products.service.mock";
import { MockStoresService, getCities } from "./__mocks__/stores.service.mock";
import { MockUsersService } from "./__mocks__/users.service.mock";

describe("ApiController", () => {
  let apiController: ApiController;
  let storesService: StoresService;
  let categoriesService: CategoriesService;
  let productsService: ProductsService;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [ApiController],
      providers: [
        {
          provide: StoresService,
          useClass: MockStoresService,
        },
        {
          provide: CategoriesService,
          useClass: MockCategoriesService,
        },
        {
          provide: ProductsService,
          useClass: MockProductsService,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: UsersService,
          useClass: MockUsersService,
        },
      ],
    }).compile();

    apiController = moduleRef.get<ApiController>(ApiController);
    storesService = moduleRef.get<StoresService>(StoresService);
    categoriesService = moduleRef.get<CategoriesService>(CategoriesService);
    productsService = moduleRef.get<ProductsService>(ProductsService);
    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe("getStores", () => {
    describe("when getStores is called", () => {
      let stores: Partial<LocalStore>[];

      beforeEach(async () => {
        stores = await apiController.getStores();
      });

      it("shoud call the storesService", () => {
        expect(storesService.getStores).toHaveBeenCalled();
      });

      it("should return the stores from json file", () => {
        expect(stores).toStrictEqual([localStoreStub()]);
      });
    });
  });

  describe("getCategories", () => {
    describe("when getCategories is called", () => {
      let categories: Partial<LocalCategory>[];

      beforeEach(async () => {
        categories = await apiController.getCategories();
      });

      it("shoud call the categoriesService", () => {
        expect(categoriesService.getCategories).toHaveBeenCalled();
      });

      it("should return the categories from json file", () => {
        expect(categories).toStrictEqual([localCategoryStub()]);
      });
    });
  });

  describe("getCities", () => {
    describe("when getCities is called", () => {
      let cities: Pick<City, "name" | "slug">[];

      beforeEach(async () => {
        cities = await apiController.getCities();
      });

      it("shoud call the categoriesService", () => {
        expect(storesService.getCities).toHaveBeenCalled();
      });

      it("should return the categories from json file", () => {
        expect(cities).toStrictEqual([getCities()]);
      });
    });
  });

  describe("getUserData", () => {
    describe("when getUserData is called", () => {
      let user: User;

      beforeEach(async () => {
        user = await apiController.getUserData(requestStub());
      });

      it("shoud call the authService", async () => {
        expect(authService.validate).toHaveBeenCalledWith(tokenStub());
        expect(authService.decode).toHaveBeenCalledWith(tokenStub());
      });

      it("should call the usersService", async () => {
        expect(usersService.getUserById).toBeCalledWith(userStub()._id);
      });

      it("should return the user", () => {
        expect(user).toStrictEqual(userStub());
      });
    });

    describe("when getUserData is called and user not authorized", () => {
      it("should throw error", async () => {
        try {
          await apiController.getUserData({ headers: {} } as Request);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
        }
      });
    });
  });
});

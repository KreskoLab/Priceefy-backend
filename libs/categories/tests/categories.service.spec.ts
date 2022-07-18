import { CategoriesService, Category } from "@app/categories";
import { CategoriesRepository } from "@app/categories/categories.repository";
import { CreateCategoryDto } from "@app/categories/dto/create-category.dto";
import { AggregationResults, ProductsResponse } from "@app/products";
import { UtilsModule } from "@app/utils";
import { Test } from "@nestjs/testing";
import { aggregationStub } from "./stubs/aggreagation.stub";
import { bulkDocStub } from "./stubs/bulk-doc.stub";
import { categoryStub } from "./stubs/category.stub";
import { CategoriesRepositoryMock, getAllIdsAndSlugs } from "./__mocks__/categories.repository.mock";

describe("CategoriesService", () => {
  let categoriesService: CategoriesService;
  let categoriesRepository: CategoriesRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UtilsModule],
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useClass: CategoriesRepositoryMock,
        },
      ],
    }).compile();

    categoriesService = moduleRef.get<CategoriesService>(CategoriesService);
    categoriesRepository = moduleRef.get<CategoriesRepository>(CategoriesRepository);

    jest.clearAllMocks();
  });

  describe("create", () => {
    describe("when create is called", () => {
      let category: Category;
      const dto: CreateCategoryDto = { name: categoryStub().name, slug: categoryStub().slug };

      beforeEach(async () => {
        category = await categoriesService.create(dto);
      });

      it("should call categoriesRepository", () => {
        expect(categoriesRepository.create).toBeCalledWith(dto);
      });

      it("should return a created category", () => {
        expect(category).toEqual(categoryStub());
      });
    });
  });

  describe("getIds", () => {
    describe("when getIds is called", () => {
      let categories: Category[];

      beforeEach(async () => {
        categories = await categoriesService.getIds();
      });

      it("should call categoriesRepository", () => {
        expect(categoriesRepository.getAllIdsAndSlugs).toHaveBeenCalledTimes(1);
      });

      it("should return a finded categories ids and slugs", () => {
        expect(categories).toEqual([getAllIdsAndSlugs()]);
      });
    });
  });

  describe("getAll", () => {
    describe("when getAll is called", () => {
      let categories: Category[];

      beforeEach(async () => {
        categories = await categoriesService.getAll();
      });

      it("should call categoriesRepository", () => {
        expect(categoriesRepository.getAllCategories).toHaveBeenCalledTimes(1);
      });

      it("should return a finded categories ids and slugs", () => {
        expect(categories).toEqual([categoryStub()]);
      });
    });
  });

  describe("getProducts", () => {
    describe("when getProducts is called", () => {
      let results: AggregationResults;

      beforeEach(async () => {
        results = await categoriesService.getProducts(categoryStub().slug, 1, "asc", "silpo", "kyiv");
      });

      it("should call categoriesRepository", () => {
        expect(categoriesRepository.getProducts).toHaveBeenCalledWith(categoryStub().slug, 1, "asc", "silpo", "kyiv");
      });

      it("should return a aggregation results", () => {
        expect(results).toEqual(aggregationStub());
      });
    });
  });

  describe("getCategories", () => {
    it("should return categories from json", async () => {
      expect(await categoriesService.getCategories()).toBeDefined();
      expect(await categoriesService.getCategories()).toBeInstanceOf(Array);
    });
  });

  describe("updateProducts", () => {
    describe("when updateProducts is called", () => {
      const update: Pick<ProductsResponse, "categories"> = {
        categories: [
          {
            id: categoryStub()._id,
            products: [],
          },
        ],
      };

      beforeEach(async () => {
        categoriesService.updateProducts(update);
      });

      it("should call categoriesRepository", () => {
        expect(categoriesRepository.updateCategoryProducts).toHaveBeenCalledWith([bulkDocStub()]);
      });
    });
  });
});

import { Category } from "@app/categories";
import { CategoriesRepository } from "@app/categories/categories.repository";
import { CreateCategoryDto } from "@app/categories/dto/create-category.dto";
import { AggregationResults } from "@app/products";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { aggregationStub } from "./stubs/aggreagation.stub";
import { bulkDocStub } from "./stubs/bulk-doc.stub";
import { categoryStub } from "./stubs/category.stub";
import { MockCategoryModel } from "./__mocks__/category.model.mock";

describe("CategoriesRepository", () => {
  let categoriesRepository: CategoriesRepository;
  let categoriesModel: MockCategoryModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesRepository,
        {
          provide: getModelToken(Category.name),
          useClass: MockCategoryModel,
        },
      ],
    }).compile();

    categoriesRepository = moduleRef.get<CategoriesRepository>(CategoriesRepository);
    categoriesModel = moduleRef.get<MockCategoryModel>(getModelToken(Category.name));

    jest.clearAllMocks();
  });

  describe("create", () => {
    describe("when create is called", () => {
      let category: Category;
      const dto: CreateCategoryDto = { name: categoryStub().name, slug: categoryStub().slug };

      beforeEach(async () => {
        jest.spyOn(categoriesModel, "create");
        category = await categoriesRepository.create(dto);
      });

      it("should call the categoryModel", () => {
        expect(categoriesModel.create).toBeCalledWith(dto);
      });

      it("Should return a created category", () => {
        expect(category).toEqual(categoryStub());
      });
    });
  });

  describe("getOneBySlug", () => {
    describe("when getOneBySlug is called", () => {
      let category: Category;

      beforeEach(async () => {
        jest.spyOn(categoriesModel, "findOne");
        category = await categoriesRepository.getOneBySlug(categoryStub().slug);
      });

      it("should call the categoryModel", () => {
        expect(categoriesModel.findOne).toBeCalledWith({ slug: categoryStub().slug });
      });

      it("Should return a finded category", () => {
        expect(category).toEqual(categoryStub());
      });
    });
  });

  describe("getAllCategories", () => {
    describe("when getAllCategories is called", () => {
      let categories: Category[];

      beforeEach(async () => {
        categoriesModel.findResults = categoryStub();

        jest.spyOn(categoriesModel, "find");
        categories = await categoriesRepository.getAllCategories();
      });

      it("should call the categoryModel", () => {
        expect(categoriesModel.find).toBeCalledWith({ products: { $exists: true, $not: { $size: 0 } } });
      });

      it("should return all categories", () => {
        expect(categories).toEqual([categoryStub()]);
      });
    });
  });

  describe("getAllIdsAndSlugs", () => {
    describe("when getAllIdsAndSlugs is called", () => {
      let categories: Category[];
      const results = { _id: categoryStub()._id, slug: categoryStub().slug };

      beforeEach(async () => {
        categoriesModel.findResults = results;

        jest.spyOn(categoriesModel, "find");
        categories = await categoriesRepository.getAllIdsAndSlugs();
      });

      it("should call the categoryModel", () => {
        expect(categoriesModel.find).toBeCalledWith({}, { _id: 1, slug: 1 });
      });

      it("should return categories ids and slugs", () => {
        expect(categories).toEqual([results]);
      });
    });
  });

  describe("updateCategoryProducts", () => {
    describe("when updateCategoryProducts is called", () => {
      beforeEach(async () => {
        jest.spyOn(categoriesModel, "bulkWrite");
        await categoriesRepository.updateCategoryProducts([bulkDocStub()]);
      });

      it("should call the categoryModel", () => {
        expect(categoriesModel.bulkWrite).toBeCalledWith([bulkDocStub()]);
      });
    });
  });

  describe("getProducts", () => {
    describe("when getProducts is called", () => {
      let results: AggregationResults[];

      beforeEach(async () => {
        jest.spyOn(categoriesModel, "aggregate");
        results = await categoriesRepository.getProducts(categoryStub().slug, 1, "asc", "silpo", "kyiv");
      });

      it("should call the categoryModel", () => {
        expect(categoriesModel.aggregate).toHaveBeenCalledTimes(1);
      });

      it("should return a aggregation results", () => {
        expect(results).toStrictEqual([aggregationStub()]);
      });
    });
  });
});

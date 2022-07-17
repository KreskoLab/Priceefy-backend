import { AggregationResults, Price, Product } from "@app/products";
import { ProductsRepository } from "@app/products/products.repository";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { bulkDocStub } from "./stubs/bulk-doc.stub";
import { priceStub } from "./stubs/price.stub";
import { productStub } from "./stubs/product.stub";
import { MockProductModel } from "./__mocks__/product.model.mock";

describe("ProductsRepositoryr", () => {
  let productsRepository: ProductsRepository;
  let productModel: MockProductModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: getModelToken(Product.name),
          useClass: MockProductModel,
        },
      ],
    }).compile();

    productsRepository = moduleRef.get<ProductsRepository>(ProductsRepository);
    productModel = moduleRef.get<MockProductModel>(getModelToken(Product.name));

    jest.clearAllMocks();
  });

  describe("create", () => {
    describe("when create is called", () => {
      beforeEach(async () => {
        jest.spyOn(productModel, "bulkWrite");
        await productsRepository.create([bulkDocStub()]);
      });

      it("should call the productModel", () => {
        expect(productModel.bulkWrite).toHaveBeenCalledWith([bulkDocStub()]);
      });
    });
  });

  describe("findBySlugs", () => {
    let products: Pick<Product, "_id" | "category" | "slug">[];

    describe("when findBySlugs is called", () => {
      beforeEach(async () => {
        jest.spyOn(productModel, "find");
        products = await productsRepository.findBySlugs([productStub().slug]);
      });

      it("should call the productModel", async () => {
        expect(productModel.find).toHaveBeenCalledWith(
          { slug: { $in: [productStub().slug] } },
          { _id: 1, category: 1, slug: 1 },
        );
      });

      it("should return finded products by slugs", () => {
        expect(products).toStrictEqual([
          { _id: productStub()._id, category: productStub().category, slug: productStub().slug },
        ]);
      });
    });
  });

  describe("aggregateByIds", () => {
    let products: Product[];

    describe("when aggregateByIds is called", () => {
      beforeEach(async () => {
        productModel.aggregationResults = [productStub()];

        jest.spyOn(productModel, "aggregate");
        products = await productsRepository.aggregateByIds([productStub()._id], "kyiv");
      });

      it("should call the productModel", async () => {
        expect(productModel.aggregate).toHaveBeenCalledTimes(1);
      });

      it("should return aggregated products by ids", () => {
        expect(products).toStrictEqual([productStub()]);
      });
    });
  });

  describe("aggregatePrices", () => {
    let products: Pick<Price, "price" | "store" | "created_at">[];

    const aggregationResults = {
      price: priceStub().price,
      store: priceStub().store,
      created_at: priceStub().created_at,
    };

    describe("when aggregatePrices is called", () => {
      beforeEach(async () => {
        productModel.aggregationResults = [aggregationResults];

        jest.spyOn(productModel, "aggregate");
        products = await productsRepository.aggregatePrices("coca-cola-2000ml", "kyiv", "week");
      });

      it("should call the productModel", async () => {
        expect(productModel.aggregate).toHaveBeenCalledTimes(1);
      });

      it("should return aggregated products by ids", () => {
        expect(products).toStrictEqual([aggregationResults]);
      });
    });
  });

  describe("findBySlug", () => {
    let products: Product[];

    describe("when findBySlug is called", () => {
      beforeEach(async () => {
        productModel.aggregationResults = [productStub()];

        jest.spyOn(productModel, "aggregate");
        products = await productsRepository.findBySlug("coca-cola-2000ml", "kyiv");
      });

      it("should call the productModel", async () => {
        expect(productModel.aggregate).toHaveBeenCalledTimes(1);
      });

      it("should return aggregated products by ids", () => {
        expect(products).toStrictEqual([productStub()]);
      });
    });
  });

  describe("findAll", () => {
    let results: AggregationResults[];
    const { _id, ...rest } = productStub();

    const aggregation = [
      {
        results: [rest],
        count: 30,
      },
    ];

    describe("when findAll is called", () => {
      beforeEach(async () => {
        productModel.aggregationResults = aggregation;

        jest.spyOn(productModel, "aggregate");
        results = await productsRepository.findAll(1, "asc", "kyiv");
      });

      it("should call the productModel", async () => {
        expect(productModel.aggregate).toHaveBeenCalledTimes(1);
      });

      it("should return aggregated products by ids", () => {
        expect(results).toStrictEqual(aggregation);
      });
    });
  });

  describe("searchAggregation", () => {
    let results: { ids: string[] }[];

    describe("when searchAggregation is called", () => {
      beforeEach(async () => {
        productModel.aggregationResults = ["coca-cola-500ml", "coca-cola-2000ml"];

        jest.spyOn(productModel, "aggregate");
        results = await productsRepository.searchAggregation("coca cola");
      });

      it("should call the productModel", async () => {
        expect(productModel.aggregate).toHaveBeenCalledTimes(1);
      });

      it("should return aggregated products by ids", () => {
        expect(results).toStrictEqual(["coca-cola-500ml", "coca-cola-2000ml"]);
      });
    });
  });
});

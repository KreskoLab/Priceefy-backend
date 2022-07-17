import { CreateProductDto, Product, ProductsService } from "@app/products";
import { ProductsRepository } from "@app/products/products.repository";
import { UtilsModule } from "@app/utils";
import { Test } from "@nestjs/testing";
import { PricesAggregationResultsStub } from "./stubs/aggregate-prices.stub";
import { bulkDocStub } from "./stubs/bulk-doc.stub";
import { priceStub } from "./stubs/price.stub";
import { productStub } from "./stubs/product.stub";
import { findAll, findBySlug, ProductsRepositoryMock } from "./__mocks__/products.repository.mock";

describe("ProductsService", () => {
  let productsService: ProductsService;
  let productsRepository: ProductsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UtilsModule],
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useClass: ProductsRepositoryMock,
        },
      ],
    }).compile();

    productsService = moduleRef.get<ProductsService>(ProductsService);
    productsRepository = moduleRef.get<ProductsRepository>(ProductsRepository);

    jest.clearAllMocks();
  });

  describe("create", () => {
    describe("when create is called", () => {
      const { _id, ...rest } = productStub();

      const dto: CreateProductDto = {
        ...rest,
        price: priceStub(),
      };

      beforeEach(async () => {
        await productsService.create([dto]);
      });

      it("should call productsRepository", async () => {
        expect(productsRepository.create).toBeCalledWith([bulkDocStub()]);
      });
    });
  });

  describe("getBySlugs", () => {
    describe("when getBySlugs is called", () => {
      let products;

      beforeEach(async () => {
        products = await productsService.getBySlugs([productStub().slug]);
      });

      it("should call the productsRepository", async () => {
        expect(productsRepository.findBySlugs).toBeCalledWith([productStub().slug]);
      });

      it("should return a products", () => {
        expect(products).toEqual([findBySlug()]);
      });
    });
  });

  describe("getAll", () => {
    describe("when getAll is called", () => {
      let products;

      beforeEach(async () => {
        products = await productsService.getAll(1, "asc", "kyiv");
      });

      it("should call the productsRepository", async () => {
        expect(productsRepository.findAll).toBeCalledWith(1, "asc", "kyiv");
      });

      it("should return a products", () => {
        expect(products).toEqual(findAll());
      });
    });
  });

  describe("getBySlug", () => {
    describe("when getBySlug is called", () => {
      let product: Product;

      beforeEach(async () => {
        product = await productsService.getBySlug(productStub().slug, "kyiv");
      });

      it("should call the productsRepository", async () => {
        expect(productsRepository.findBySlug).toBeCalledWith(productStub().slug, "kyiv");
      });

      it("should return a products", () => {
        expect(product).toEqual(productStub());
      });
    });
  });

  describe("getByIds", () => {
    describe("when getByIds is called", () => {
      let products: Product[];

      beforeEach(async () => {
        products = await productsService.getByIds([productStub()._id], "kyiv");
      });

      it("should call the productsRepository", async () => {
        expect(productsRepository.aggregateByIds).toBeCalledWith([productStub()._id], "kyiv");
      });

      it("should return a products", () => {
        expect(products).toEqual([productStub()]);
      });
    });
  });

  describe("getPrices", () => {
    describe("when getPrices is called", () => {
      let prices;

      beforeEach(async () => {
        prices = await productsService.getPrices(productStub().slug, "kyiv", "week");
      });

      it("should call the productsRepository", async () => {
        expect(productsRepository.aggregatePrices).toBeCalledWith(productStub().slug, "kyiv", "week");
      });

      it("should return a prices", () => {
        expect(prices).toEqual([PricesAggregationResultsStub()]);
      });
    });
  });

  describe("search", () => {
    describe("when search is called", () => {
      let products: Product[];

      beforeEach(async () => {
        products = await productsService.search("coca cola", "kyiv");
      });

      it("should call the productsRepository", async () => {
        expect(productsRepository.searchAggregation).toBeCalledWith("coca cola");
        expect(productsRepository.aggregateByIds).toBeCalledWith([productStub().slug], "kyiv");
      });

      it("should return a founded products", () => {
        expect(products).toEqual([productStub()]);
      });
    });
  });
});

import { AggregationResults, ProductsResponse } from "@app/products";
import { City, Store, StoresService } from "@app/stores";
import { CreateStoreDto } from "@app/stores/dto/create-store.dto";
import { StoresRepository } from "@app/stores/stores.repository";
import { UtilsModule } from "@app/utils";
import { Test } from "@nestjs/testing";
import { aggregationStub } from "./stubs/aggregation.stub";
import { bulkDocStub } from "./stubs/bulk-doc.stub";
import { storeStub } from "./stubs/store.stub";
import { StoresRepositoryMock } from "./__mocks__/stores.repository.mock";

describe("StoreService", () => {
  let storesService: StoresService;
  let storesRepository: StoresRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UtilsModule],
      providers: [
        StoresService,
        {
          provide: StoresRepository,
          useClass: StoresRepositoryMock,
        },
      ],
    }).compile();

    storesService = moduleRef.get<StoresService>(StoresService);
    storesRepository = moduleRef.get<StoresRepository>(StoresRepository);

    jest.clearAllMocks();
  });

  describe("create", () => {
    describe("when create is called", () => {
      let store: Store;
      const dto: CreateStoreDto = { name: storeStub().name, slug: storeStub().slug };

      beforeEach(async () => {
        store = await storesService.create(dto);
      });

      it("should call storesRepository", async () => {
        expect(storesRepository.create).toBeCalledWith(dto);
      });

      it("should return a store", () => {
        expect(store).toEqual(storeStub());
      });
    });
  });

  describe("getStores", () => {
    it("should return stores", async () => {
      expect(await storesService.getStores()).toBeDefined();
      expect(await storesService.getStores()).toBeInstanceOf(Array);
    });
  });

  describe("getCities", () => {
    describe("when getCities is called", () => {
      let cities: Pick<City, "name" | "slug">[];

      beforeEach(async () => {
        cities = await storesService.getCities();
      });

      it("should return a cities", () => {
        const results = [
          {
            name: "Київ",
            slug: "kyiv",
          },
          {
            name: "Львів",
            slug: "lviv",
          },
          {
            name: "Дніпро",
            slug: "dnipro",
          },
          {
            name: "Одеса",
            slug: "odesa",
          },
          {
            name: "Харків",
            slug: "kharkiv",
          },
        ];

        expect(cities).toEqual(results);
      });
    });
  });

  describe("getProducts", () => {
    describe("when getProducts is called", () => {
      let results: AggregationResults;

      beforeEach(async () => {
        results = await storesService.getProducts("silpo", 1, "asc", "kyiv");
      });

      it("should call the storesRepository", async () => {
        expect(storesRepository.aggregateProducts).toBeCalledWith("silpo", 1, "asc", "kyiv");
      });

      it("should return a products", () => {
        expect(results).toEqual(aggregationStub());
      });
    });
  });

  describe("updateProducts", () => {
    describe("when updateProducts is called", () => {
      beforeEach(async () => {
        const products: Pick<ProductsResponse, "stores"> = { stores: [{ slug: storeStub().slug, products: [] }] };
        await storesService.updateProducts(products);
      });

      it("should call the storesRepository", async () => {
        expect(storesRepository.bulkWrite).toBeDefined();
        expect(storesRepository.bulkWrite).toBeCalledWith([bulkDocStub()]);
      });
    });
  });
});

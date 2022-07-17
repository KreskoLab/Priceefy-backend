import { Store } from "@app/stores";
import { CreateStoreDto } from "@app/stores/dto/create-store.dto";
import { StoresRepository } from "@app/stores/stores.repository";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { storeStub } from "./stubs/store.stub";
import { bulkDocStub } from "./stubs/bulk-doc.stub";
import { MockStoreModel } from "./__mocks__/store.model.mock";
import { AggregationResults } from "@app/products";
import { aggregationStub } from "./stubs/aggregation.stub";

describe("StoresRepository", () => {
  let storesRepository: StoresRepository;
  let storeModel: MockStoreModel;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StoresRepository,
        {
          provide: getModelToken(Store.name),
          useClass: MockStoreModel,
        },
      ],
    }).compile();

    storesRepository = moduleRef.get<StoresRepository>(StoresRepository);
    storeModel = moduleRef.get<MockStoreModel>(getModelToken(Store.name));

    jest.clearAllMocks();
  });

  describe("create", () => {
    let store: Store;
    const dto: CreateStoreDto = { name: storeStub().name, slug: storeStub().slug };

    describe("when create is called", () => {
      beforeEach(async () => {
        jest.spyOn(storeModel, "create");
        store = await storesRepository.create(dto);
      });

      it("should call the storeModel", async () => {
        expect(storeModel.create).toHaveBeenCalledWith(dto);
      });

      it("should return a new store", () => {
        expect(store).toEqual(storeStub());
      });
    });
  });

  describe("bulkWrite", () => {
    describe("when bulkWrite is called", () => {
      beforeEach(async () => {
        jest.spyOn(storeModel, "bulkWrite");
        await storesRepository.bulkWrite([bulkDocStub()]);
      });

      it("should call the storeModel", async () => {
        expect(storeModel.bulkWrite).toHaveBeenCalledWith([bulkDocStub()]);
        expect(storeModel.bulkWrite).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("aggregateProducts", () => {
    let results: AggregationResults[];

    describe("when aggregateProducts is called", () => {
      beforeEach(async () => {
        jest.spyOn(storeModel, "aggregate");
        results = await storesRepository.aggregateProducts("silpo", 1, "asc", "kyiv");
      });

      it("should call the storeModel", async () => {
        expect(storeModel.aggregate).toHaveBeenCalledTimes(1);
      });

      it("should return a aggragation results", () => {
        expect(results).toStrictEqual([aggregationStub()]);
      });
    });
  });
});

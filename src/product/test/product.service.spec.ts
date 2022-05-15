import { Test } from "@nestjs/testing";
import { ProductService } from "../product.service";
import { ProductRepository } from "../product.repository";
import { mockProductRepository } from "../__mocks__/product.repository";
import { productInterfaceStub } from "./stubs/product.interface.stub";
import { productStub } from "./stubs/product.stub";

describe("ProductService", () => {
  let productService: ProductService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    productService = moduleRef.get<ProductService>(ProductService);
  });

  it("should be defined", () => {
    expect(productService).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new product", async () => {
    await expect(productService.create([productInterfaceStub()])).resolves.not.toThrow();
  });

  it("should find products by array of products slugs and return products ids and slugs", async () => {
    mockProductRepository.findProductsCategoriesIdsInArray.mockResolvedValue([productStub()]);

    const findedProduts = await productService.findManyIds(["yabluko"]);
    expect(findedProduts).toEqual([productStub()]);
  });
});

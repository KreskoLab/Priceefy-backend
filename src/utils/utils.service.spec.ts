import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { UtilsService } from "./utils.service";

describe("CatsController", () => {
  let utilsService: UtilsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UtilsService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    utilsService = moduleRef.get<UtilsService>(UtilsService);
  });

  describe("slug", () => {
    it("should return string slug", async () => {
      expect(utilsService.slugify("Морква")).toBe("Morkva");
    });
  });

  describe("normalize product name", () => {
    it("should return product name without weight and unit", async () => {
      expect(utilsService.normalizeName("Coca cola 1л")).toBe("Coca cola");
    });

    it("should return product name without useless words", async () => {
      expect(utilsService.normalizeName("Яблуко вагове українське")).toBe("Яблуко українське");
    });

    it("should return product name without symbols", async () => {
      expect(utilsService.normalizeName("Ківі (корзинка), 600г")).toBe("Ківі корзинка");
    });

    it("should return product name with percentage", async () => {
      expect(utilsService.normalizeName("Молоко біла лінія 25%")).toBe("Молоко біла лінія 25%");
    });

    it("should return product name with float percentage", async () => {
      expect(utilsService.normalizeName("Молоко «Галичина» ультрапастеризоване 3,2%")).toBe(
        "Молоко галичина ультрапастеризоване 3,2%",
      );
    });

    it("should return product name with float", async () => {
      expect(utilsService.normalizeName("Молоко Lactel з вітаміном D3 ультрапастеризоване 0,5% 950г")).toBe(
        "Молоко lactel з вітаміном d3 ультрапастеризоване 0,5%",
      );
    });

    it("should return product name withot float weight", async () => {
      expect(utilsService.normalizeName("Напій газований 7up 0,33мл")).toBe("7up");
    });

    it("should return product name with number", async () => {
      expect(utilsService.normalizeName("Напій газований 7up 1л")).toBe("7up");
    });

    it("should return product name without unit", async () => {
      expect(utilsService.normalizeName("Манго, шт")).toBe("Манго");
    });
  });
});

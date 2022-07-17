import { UtilsService } from "@app/utils";
import { Test } from "@nestjs/testing";

describe("UtilsService", () => {
  let utilsService: UtilsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UtilsService],
    }).compile();

    utilsService = moduleRef.get<UtilsService>(UtilsService);
  });

  describe("slugify", () => {
    it("should return string slug", () => {
      const result = "pepsi-max-2l";
      const target = "Pepsi Max 2л";

      expect(utilsService.slugify(target)).toEqual(result);
    });
  });

  describe("readData", () => {
    it("should read stores.json file", async () => {
      expect(await utilsService.readData("stores.json")).toBeDefined();
      expect(await utilsService.readData("stores.json")).toBeInstanceOf(Array);
    });

    it("should read categories.json file", async () => {
      expect(await utilsService.readData("categories.json")).toBeDefined();
      expect(await utilsService.readData("categories.json")).toBeInstanceOf(Array);
    });
  });

  describe("normalizeName", () => {
    it("should return normolized product name without useless words and product unit and weight #1", () => {
      const result = "Coca-Cola";
      const target = "Напій Coca-Cola сильногазований 1,5л";

      expect(utilsService.normalizeName(target, "soft-drinks", "Coca-Cola")).toEqual(result);
    });

    it("should return normolized product name without useless words and product unit and weight #2", () => {
      const result = "Lays з сіллю";
      const target = "Чіпси Lay's з сіллю 60г";

      expect(utilsService.normalizeName(target, "crisps", "Lay`s")).toEqual(result);
    });

    it("should return normolized product name without useless words and product unit and weight #3", () => {
      const result = "Авокадо великий";
      const target = "Авокадо великий, шт";

      expect(utilsService.normalizeName(target, "fruits", "")).toEqual(result);
    });

    it("should return normolized product name without useless words and product unit and weight #4", () => {
      const result = "Манго великий калібр";
      const target = "Манго великий калібр С 551-800г";

      expect(utilsService.normalizeName(target, "fruits", "")).toEqual(result);
    });

    it("should return normolized product name without useless words and product unit and weight #5", () => {
      const result = "Молоко Ферма пастеризоване 2,5%";
      const target = "Молоко Ферма пастеризоване 2,5% 840г";

      expect(utilsService.normalizeName(target, "milk", "Ферма")).toEqual(result);
    });
  });

  describe("handleSilpoWeightAndPrice", () => {
    it("should return handled product weight, unit and price from Silpo store #1", () => {
      const result = { price: 50, unit: "ml", weight: 2000 };
      expect(utilsService.handleSilpoWeightAndPrice(50, "2л", "soft-drinks")).toStrictEqual(result);
    });

    it("should return handled product weight, unit and price from Silpo store #2", () => {
      const result = { price: 250, unit: "kg", weight: 1 };
      expect(utilsService.handleSilpoWeightAndPrice(25, "100г", "meat")).toStrictEqual(result);
    });

    it("should return handled product weight, unit and price from Silpo store #3", () => {
      const result = { price: 50, unit: "g", weight: 500 };
      expect(utilsService.handleSilpoWeightAndPrice(50, "0,5кг", "fruits")).toStrictEqual(result);
    });
  });

  describe("handleZakazWeight", () => {
    it("should return handled product weight and unit #1", () => {
      const result = { unit: "kg", weight: 1 };
      expect(utilsService.handleZakazWeight("kg", 1, 1, null, null, "fruits", "")).toStrictEqual(result);
    });

    it("should return handled product weight and unit #2", () => {
      const result = { unit: "ml", weight: 2000 };
      expect(utilsService.handleZakazWeight("pcs", null, null, 2000, null, "soft-drinks", "")).toStrictEqual(result);
    });

    it("should return handled product weight and unit #3", () => {
      const result = { unit: "pcs", weight: 1 };
      expect(utilsService.handleZakazWeight("pcs", null, 1, null, null, "vegetables", "")).toStrictEqual(result);
    });
  });
});

import { Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import { resolve } from "path";
import { CATEGORIES } from "@app/categories/enums/category";
import Slugify from "slugify";

@Injectable()
export class UtilsService {
  public async readData<T>(filename: string): Promise<T> {
    const path = resolve("./dist/", "data", filename);

    const rawData = await fs.readFile(path, {
      encoding: "utf-8",
    });

    return JSON.parse(rawData);
  }

  public slugify(slug: string): string {
    return Slugify(slug).toLowerCase();
  }

  public normalizeName(name: string, category: `${CATEGORIES}`, trademark: string): string {
    const uselessWords: string[] = [];

    let normalized = name
      .toLowerCase()
      .replace(".", ",")
      .replace(/\d+(?=[^(]*\))/, "")
      .replace(
        // eslint-disable-next-line max-len
        /(?<![\u0400-\u04ff])(\d+(\,\d+)?кг|\d+шт|\d+(\,\d+)?г|\d+(\,\d+)?л|\d+(\,\d+)?мл|в*|пв|шт|пе|ппл|пп|пє|пе|х|а)(?![\u0400-\u04ff])/g,
        "",
      )
      .replace(/[~!@#$^&«»®*()+={}\[\];:\'\"<>\/\\\?-_]/g, "")
      .replace(/ +/g, " ")
      .trim()
      .replace(/(^,)|(,$)/g, "");

    switch (category) {
      case CATEGORIES.FRUITS:
      case CATEGORIES.VEGETABLES:
        uselessWords.push("ваговий", "вагове", "вагова", "свіжий", "свіжа", "органічне", "органічна");
        break;

      case CATEGORIES.MILK:
        uselessWords.push("пе", "пп", "органічне");
        break;

      case CATEGORIES.CRISPS:
        uselessWords.push("чипси", "чіпси", "картопляні", "картоп");

        normalized = normalized
          .replace("baked", "запечені")
          .replace("гостр", "гострих")
          .replace(/(?<![\u0400-\u04ff])і(?![\u0400-\u04ff])/g, "та");

        break;

      case CATEGORIES.SOFT_DRINKS:
        uselessWords.push(
          "напій",
          "газований",
          "пепсі-кола",
          "безалкогольний",
          "сильногазований",
          "середньогазований",
          "соковмісний",
          "сокомісткий",
          "скло",
          "безкалорійний",
          "з/б",
          "зб",
          "жб",
          "ж/б",
          "питний",
          "б/алк",
          "балк",
          "сил/газ",
          "пляшка",
        );

        normalized = normalized
          .replace("пепсі-блек", "max")
          .replace("black", "max")
          .replace("orange", "апельсин")
          .replace("негазований", "без газу");
        break;
    }

    const expStr = new RegExp("(?<![\u0400-\u04ff])" + uselessWords.join("|") + "(?![\u0400-\u04ff])", "gi");
    normalized = normalized.replace(expStr, "").replace(/ +/g, " ").trim();

    if (trademark) {
      normalized = normalized.replace(trademark.toLowerCase(), trademark);
    }

    const normalizedName = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return normalizedName;
  }

  private handleWeightAndUnit(weight: number, unit: string) {
    switch (unit) {
      case "л":
      case "*л":
        return { weight: weight * 1000, unit: "ml" };

      case "мл":
        return { weight: weight, unit: "ml" };

      case "kg":
      case "кг":
        return { weight: weight, unit: "kg" };

      case "г":
      case "*г":
      case "*г/уп":
        return { weight: weight, unit: "g" };

      case "шт":
      case "шт/уп":
      case "уп":
      case "бух":
      case "пучок":
      case "pcs":
        return { weight: weight, unit: "pcs" };

      default:
        console.log(unit, "Unknown weight unit");
    }
  }

  public handleDiscountDate(date: any, store: string): string {
    if (store === "silpo") {
      const dateParts = date.split(".");
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]).toISOString();
    } else {
      const parts = date.split("-");
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])).toISOString();
    }
  }

  public handleSilpoWeightAndPrice(
    price: number,
    unit: string,
    category: `${CATEGORIES}`,
  ): { price: number; weight: number; unit: string } {
    const extractedWeight = parseFloat(unit.replace(",", ".").replace(/[^0-9.]/g, ""));
    const extractedUnit = unit.replace(",", "").replace(/[0-9]/g, "");

    let silpoUnit = extractedUnit;
    let silpoWeight = extractedWeight && extractedWeight > 0 ? extractedWeight : 1;
    let silpoPrice = 1;

    switch (category) {
      case CATEGORIES.FRUITS:
      case CATEGORIES.VEGETABLES:
      case CATEGORIES.MEAT:
        if (extractedUnit === "г" && extractedWeight === 100) {
          silpoWeight = 1;
          silpoPrice = 10;
          silpoUnit = "кг";
        } else if (extractedUnit === "кг" && extractedWeight < 1) {
          silpoWeight = extractedWeight * 1000;
          silpoUnit = "г";
        }

        break;

      case CATEGORIES.MILK:
      case CATEGORIES.SOFT_DRINKS:
      case CATEGORIES.JUICE:
        if (extractedUnit === "л") {
          silpoWeight = extractedWeight * 1000;
        }

        silpoUnit = "мл";
        break;
    }

    const result = this.handleWeightAndUnit(silpoWeight, silpoUnit);
    return { price: price * silpoPrice, weight: result.weight, unit: result.unit };
  }

  public handleZakazWeight(
    unit: string,
    weight: number,
    bundle: number,
    volume: number,
    pack_amount: number,
    category: `${CATEGORIES}`,
    title: string,
  ) {
    const extracted = title
      .split(" ")
      .pop()
      .replace(/[`~!@#$%^&*()_|+\-=?;:]/gi, "");

    const extractedWeight = parseFloat(extracted.replace(",", ".").replace(/[^0-9.]/g, ""));

    switch (category) {
      case CATEGORIES.MILK:
      case CATEGORIES.YOGURT:
        if (typeof extractedWeight === "number" && extractedWeight > 0) {
          if (extractedWeight > 5) return this.handleWeightAndUnit(extractedWeight, "мл");
          else return this.handleWeightAndUnit(extractedWeight, "л");
        } else {
          if (weight > 5) return this.handleWeightAndUnit(weight, "мл");
          else return this.handleWeightAndUnit(weight, "л");
        }

      case CATEGORIES.SOFT_DRINKS:
      case CATEGORIES.JUICE:
        if (pack_amount && pack_amount > 0) {
          return this.handleWeightAndUnit(pack_amount, "шт");
        } else {
          if (typeof extractedWeight === "number" && extractedWeight > 0) {
            if (extractedWeight > 5) return this.handleWeightAndUnit(extractedWeight, "мл");
            else return this.handleWeightAndUnit(extractedWeight, "л");
          } else return this.handleWeightAndUnit(volume, "мл");
        }

      case CATEGORIES.FRUITS:
      case CATEGORIES.VEGETABLES:
        if (unit === "kg") {
          return this.handleWeightAndUnit(bundle, unit);
        }

        if (unit === "pcs") {
          if (bundle > 0) {
            return this.handleWeightAndUnit(bundle, "шт");
          }

          if (pack_amount > 0) {
            return this.handleWeightAndUnit(pack_amount, "шт");
          } else return this.handleWeightAndUnit(weight, "г");
        }

      case CATEGORIES.ICECREAM:
      case CATEGORIES.COOKIES:
      case CATEGORIES.CHOCOLATE:
      case CATEGORIES.CRISPS:
      case CATEGORIES.CROISANT:
      case CATEGORIES.MARSHMALLOW:
        if (typeof extractedWeight === "number" && extractedWeight > 0) {
          if (extractedWeight > 5) return this.handleWeightAndUnit(extractedWeight, "г");
          else return this.handleWeightAndUnit(extractedWeight, "кг");
        } else {
          if (unit === "kg") {
            return this.handleWeightAndUnit(bundle, "кг");
          }

          if (unit === "pcs") {
            return this.handleWeightAndUnit(weight, "г");
          }
        }

      case CATEGORIES.MEAT:
        if (typeof extractedWeight === "number" && extractedWeight > 0) {
          if (extractedWeight > 5) return this.handleWeightAndUnit(extractedWeight, "г");
          else {
            if (extractedWeight < 1) {
              return this.handleWeightAndUnit(extractedWeight * 100, "г");
            } else return this.handleWeightAndUnit(extractedWeight, "кг");
          }
        } else {
          if (unit === "kg" && weight === 0) {
            return this.handleWeightAndUnit(bundle, "кг");
          }

          if (unit === "pcs" && weight !== 0) {
            return this.handleWeightAndUnit(weight, "г");
          }
        }
    }
  }
}

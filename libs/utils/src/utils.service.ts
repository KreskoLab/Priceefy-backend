import { Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import { resolve } from "path";
import { CATEGORIES } from "@app/categories/enums/category";
import Slugify from "slugify";

@Injectable()
export class UtilsService {
  async readData<T>(filename: string): Promise<T> {
    const path = resolve("./dist/", "data", filename);

    const rawData = await fs.readFile(path, {
      encoding: "utf-8",
    });

    return JSON.parse(rawData);
  }

  public slugify(slug: string): string {
    return Slugify(slug);
  }

  public normalizeName(name: string, category: `${CATEGORIES}`): string {
    const uselessWords = [
      "ваговий",
      "вагове",
      "вагова",
      "свіжий",
      "свіжа",
      "органічне",
      "преміум",
      "елітний",
      "еліт",
      "напій",
      "газований",
      "негазований",
      "чай",
      "холодний",
      "соковмісний",
      "сокомісткий",
      "безалкогольний",
      "питний",
      "б/алк",
      "сил/газ",
      "добрий",
      "звичай",
      "калібр",
      "сильногазований",
      "імпорт",
      "скло",
      "4х0",
      "чипси",
      "чіпси",
      "снек",
      "пікантний",
      "картопляні",
      "натуральні",
      "картоп",
      "пепсі-кола",
    ];

    const expStr = uselessWords.join("|");

    let normalized = name
      .toLowerCase()
      .replace(new RegExp(expStr, "gi"), "")
      .replace(".", ",")
      .replace(/\d+(?=[^(]*\))/, "")
      .replace(
        // eslint-disable-next-line max-len
        /(?<![\u0400-\u04ff])(\d+(\,\d+)?кг|\d+шт|\d+(\,\d+)?г|\d+(\,\d+)?л|\d+(\,\d+)?мл|в*|пв|шт|пе|ппл|пп|пє|пе|х|а)(?![\u0400-\u04ff])/g,
        "",
      )
      .replace(/[~`!@#$^&«»®*()+={}\[\];:\'\"<>\/\\\?-_]/g, "")
      .replace(/ +/g, " ")
      .trim()
      .replace(/(^,)|(,$)/g, "");

    switch (category) {
      case CATEGORIES.SOFT_DRINKS:
        normalized = normalized.replace("пепсі-блек", "max");
        break;

      case CATEGORIES.CRISPS:
        normalized = normalized.replace("baked", "запечені");
        normalized = normalized.replace("гостр", "гострих");
        break;
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
    const normalizedWeight = parseFloat(unit.replace(",", ".").replace(/[^0-9.]/g, ""));
    const normalizedUnit = unit.replace(",", "").replace(/[0-9]/g, "");

    switch (category) {
      case CATEGORIES.FRUITS:
      case CATEGORIES.VEGETABLES:
      case CATEGORIES.MEAT:
        if (normalizedWeight && normalizedWeight === 100) {
          const { unit, weight } = this.handleWeightAndUnit(1, "kg");
          return { price: price * 10, weight, unit };
        } else {
          const { unit, weight } = this.handleWeightAndUnit(normalizedWeight ? normalizedWeight : 1, normalizedUnit);
          return { price, weight, unit };
        }

      default:
        const { unit, weight } = this.handleWeightAndUnit(normalizedWeight ? normalizedWeight : 1, normalizedUnit);
        return { price, weight, unit };
    }
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
    const extraced = title
      .split(" ")
      .pop()
      .replace(/[`~!@#$%^&*()_|+\-=?;:]/gi, "");

    const extractedWeight = extraced.match(/\d+/) ? Number(extraced.match(/\d+/)[0]) : "";

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
        if (typeof extractedWeight === "number") {
          if (extractedWeight > 5) return this.handleWeightAndUnit(extractedWeight, "г");
          else return this.handleWeightAndUnit(extractedWeight, "кг");
        } else {
          if (weight > 5) return this.handleWeightAndUnit(weight, "г");
          else return this.handleWeightAndUnit(weight, "кг");
        }

      case CATEGORIES.MEAT:
        if (typeof extractedWeight === "number") {
          if (extractedWeight > 5) return this.handleWeightAndUnit(extractedWeight, "г");
          else return this.handleWeightAndUnit(extractedWeight, "кг");
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

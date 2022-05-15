import { Injectable } from "@nestjs/common";
import Slugify from "slugify";
import { promises as fs } from "fs";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

@Injectable()
export class UtilsService {
  constructor(private httpService: HttpService, private configService: ConfigService) {}

  slugify(slug: string): string {
    return Slugify(slug);
  }

  async readData(path: string): Promise<Array<any>> {
    const rawData = await fs.readFile(process.cwd() + path, {
      encoding: "utf-8",
    });

    return JSON.parse(rawData);
  }

  async saveImage(imageURL: string, imageName: string): Promise<string> {
    const url = this.configService.get<string>("main.imagesURL");

    await firstValueFrom(
      this.httpService.post(url, {
        name: imageName,
        url: imageURL,
      }),
    );

    return `${imageName}.png`;
  }

  normalizeName(name: string): string {
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
      "добрий",
      "звичай",
      "калібр",
      "сильногазований",
      "пепсі-кола",
      "пепсі-блек",
      "скло",
      "іспанія",
      "туреччина",
      "єгипет",
      "бразилія",
      "пакистан",
      "україна",
      "4х0",
    ];

    const expStr = uselessWords.join("|");
    const normalized = name
      .toLowerCase()
      .replace(new RegExp(expStr, "gi"), "")
      .replace(".", ",")
      .replace(/\d+(?=[^(]*\))/, "")
      .replace(
        // eslint-disable-next-line max-len
        /(?<![\u0400-\u04ff])(\d+(\,\d+)?кг|\d+шт|\d+(\,\d+)?г|\d+(\,\d+)?л|\d+(\,\d+)?мл|в*|пв|шт|пе|ппл|пп|пє|пе|х|а)(?![\u0400-\u04ff])/g,
        "",
      )
      .replace(/[-~`!@#$^&«»®*()+={}\[\];:\'\"<>\/\\\?-_]/g, "")
      .replace(/ +/g, " ")
      .trim()
      .replace(/(^,)|(,$)/g, "");

    const normalizedName = normalized.charAt(0).toUpperCase() + normalized.slice(1);

    return normalizedName;
  }

  handleWeightAndUnit(weight: number, unit: string, category?: string): object {
    switch (unit) {
      case "л":
      case "*л":
        return { weight: weight * 1000, unit: "ml" };
      case "мл":
        return { weight: weight, unit: "ml" };
      case "kg":
      case "кг":
        return { weight: weight, unit: "kg" };
      case "pcs":
        return weight > 10 ? { weight: weight, unit: "g" } : { weight: weight, unit: "pcs" };
      case "г":
      case "*г":
        return weight === 100 && (category === "378" || category === "381")
          ? { weight: 1, unit: "kg" }
          : { weight: weight, unit: "g" };
      case "шт":
      case "шт/уп":
      case "уп":
      case "бух":
      case "пучок":
        return { weight: 1, unit: "pcs" };
      default:
        console.log(unit, "dada");
    }
  }

  handleDiscountDate(date: any, store: string): Date {
    if (store === "silpo") {
      const dateParts = date.split(".");
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    } else {
      const parts = date.split("-");
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    }
  }
}

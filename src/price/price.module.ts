import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Price, PriceSchema } from "./schemas/price.schema";
import { PriceService } from "./price.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Price.name, schema: PriceSchema }])],
  providers: [PriceService],
  exports: [PriceService],
  controllers: [],
})
export class PriceModule {}

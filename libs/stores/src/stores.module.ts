import { Module } from "@nestjs/common";
import { StoresService } from "./stores.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Store, StoreSchema } from "./schemas/store.schema";
import { UtilsModule } from "@app/utils";
import { StoresRepository } from "./stores.repository";

@Module({
  imports: [UtilsModule, MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }])],
  providers: [StoresService, StoresRepository],
  exports: [StoresService],
})
export class StoresModule {}

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { UtilsService } from "./utils.service";

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [UtilsService],
  exports: [UtilsService],
})
export class UtilsModule {}

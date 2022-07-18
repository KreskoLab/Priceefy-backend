import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ApiModule } from "./api.module";

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.enableCors({
    origin: configService.get<string>("FRONTEND_URL"),
    credentials: true,
  });

  await app.listen(8000);
}
bootstrap();

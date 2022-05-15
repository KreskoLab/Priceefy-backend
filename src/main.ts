import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  process.env.TZ = "Europa/Kiev";

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 8000);
}
bootstrap();

import { NestFactory } from "@nestjs/core";
import { ScannerModule } from "./scanner.module";

async function bootstrap() {
  const app = await NestFactory.create(ScannerModule, {
    logger: ["log"],
  });

  await app.listen(8000);
}
bootstrap();

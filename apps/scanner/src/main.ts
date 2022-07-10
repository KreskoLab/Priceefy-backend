import { NestFactory } from "@nestjs/core";
import { ScannerModule } from "./scanner.module";

async function bootstrap() {
  const app = await NestFactory.create(ScannerModule);
  await app.listen(8000);
}
bootstrap();

import { registerAs } from "@nestjs/config";

export default registerAs("main", () => ({
  port: Number(process.env.PORT) || 8000,
  dbLink: `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/`,
  dbName: process.env.DB_DATABASE,
  imagesURL: process.env.IMAGES_URL,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  redisPassword: process.env.REDIS_PASSWORD,
}));

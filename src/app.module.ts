import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./prisma/prisma.service";
import { envSchema } from "@/env";
import { AuthModule } from "./auth/auth.module";
import { CreateAccountController } from "./controllers/account.controller";
import { AuthenticateController } from "./controllers/authenticate.controller";
import { ProductsModule } from "./products/products.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { FavoritesController } from "./favorites/favorites.controller";
import { FavoritesService } from "./favorites/favorites.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    ProductsModule,
    FavoritesModule,
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    FavoritesController,
  ],
  providers: [PrismaService, FavoritesService],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { FavoritesService } from "./favorites.service";
import { PrismaService } from "@/prisma/prisma.service";
import { FavoritesController } from "./favorites.controller";

@Module({
  providers: [FavoritesService, PrismaService],
  controllers: [FavoritesController],
})
export class FavoritesModule {}

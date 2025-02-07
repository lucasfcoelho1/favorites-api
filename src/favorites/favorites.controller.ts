import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
import { FavoritesService } from "./favorites.service";

@Controller("/favorites")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // cria uma lista
  @Post(":userId")
  async createFavoriteList(
    @Param("userId") userId: string,
    @Body() body: { title: string; description?: string }
  ) {
    return this.favoritesService.createFavoriteList(
      userId,
      body.title,
      body.description
    );
  }

  // adiciona um produto
  @Post(":userId/product/:productId")
  async addProductToFavorites(
    @Param("userId") userId: string,
    @Param("productId", ParseIntPipe) productId: number
  ) {
    return this.favoritesService.addProductToFavorites(userId, productId);
  }

  // retorna a lista de favoritos
  @Get(":userId")
  async getUserFavorites(@Param("userId") userId: string) {
    return this.favoritesService.getUserFavorites(userId);
  }

  // remove um produto da lista
  @Delete(":userId/product/:productId")
  async removeProductFromFavorites(
    @Param("userId") userId: string,
    @Param("productId", ParseIntPipe) productId: number
  ) {
    return this.favoritesService.removeProductFromFavorites(userId, productId);
  }

  // apaga a lista
  @Delete(":userId")
  async deleteFavoriteList(@Param("userId") userId: string) {
    return this.favoritesService.deleteFavoriteList(userId);
  }
}

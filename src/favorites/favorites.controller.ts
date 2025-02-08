import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common'
import { FavoritesService } from './favorites.service'

@Controller('/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':userId')
  async createUniqueFavoriteList(
    @Param('userId') userId: string,
    @Body() body: { title: string; description?: string }
  ) {
    return this.favoritesService.createUniqueFavoriteList(
      userId,
      body.title,
      body.description
    )
  }

  @Post(':userId/product/:productId')
  async addProductToFavorites(
    @Param('userId') userId: string,
    @Param('productId') productId: string
  ) {
    console.log('userId', userId)
    console.log('productId', productId)
    return this.favoritesService.addProductToFavorites(userId, productId)
  }

  @Get(':userId')
  async getUserFavorites(@Param('userId') userId: string) {
    return this.favoritesService.getUserFavorites(userId)
  }

  @Delete(':userId/product/:productId')
  async removeProductFromFavorites(
    @Param('userId') userId: string,
    @Param('productId') productId: string
  ) {
    return this.favoritesService.removeProductFromFavorites(userId, productId)
  }

  @Delete(':userId')
  async deleteFavoriteList(@Param('userId') userId: string) {
    return this.favoritesService.deleteFavoriteList(userId)
  }
}

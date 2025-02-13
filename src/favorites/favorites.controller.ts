import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { FavoritesService } from './favorites.service'
import { AuthGuard } from '@nestjs/passport'

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('/user/:userId')
  async createUniqueFavoriteList(
    @Param('userId') userId: string,
    @Body() body: { title: string; description: string }
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
    return this.favoritesService.addProductToFavorites(userId, productId)
  }

  @Get('/user/:userId')
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

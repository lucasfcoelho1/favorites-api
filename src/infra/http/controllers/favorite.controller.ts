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
import { FavoriteService } from '../../../favorite/favorite.service'
import { AuthGuard } from '@nestjs/passport'

@Controller('favorite')
@UseGuards(AuthGuard('jwt'))
export class FavoriteController {
  constructor(private readonly FavoriteService: FavoriteService) {}

  @Post('/user/:userId')
  async createUniqueFavoriteList(
    @Param('userId') userId: string,
    @Body() body: { title: string; description: string }
  ) {
    return this.FavoriteService.createUniqueFavoriteList(
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
    return this.FavoriteService.addProductToFavorites(userId, productId)
  }

  @Get('/user/:userId')
  async getUserFavorites(@Param('userId') userId: string) {
    return this.FavoriteService.getUserFavorites(userId)
  }

  @Delete(':userId/product/:productId')
  async removeProductFromFavorites(
    @Param('userId') userId: string,
    @Param('productId') productId: string
  ) {
    return this.FavoriteService.removeProductFromFavorites(userId, productId)
  }

  @Delete(':userId')
  async deleteFavoriteList(@Param('userId') userId: string) {
    return this.FavoriteService.deleteFavoriteList(userId)
  }
}

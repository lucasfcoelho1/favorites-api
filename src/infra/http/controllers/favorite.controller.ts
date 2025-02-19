import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common'
import { FavoriteService } from '../../../favorite/favorite.service'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

@ApiTags('favorite')
@Controller('favorite')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class FavoriteController {
  constructor(private readonly FavoriteService: FavoriteService) {}

  @Post('/user/:userId')
  @ApiOperation({ summary: 'Criar uma lista de favoritos para um usuário' })
  @ApiResponse({
    status: 201,
    description: 'Lista de favoritos criada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'O usuário já tem uma lista, não é possível criar outra.',
  })
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
  @ApiOperation({ summary: 'Adicionar um produto aos favoritos' })
  @ApiResponse({
    status: 201,
    description: 'Produto adicionado aos favoritos com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário ou produto não encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Limite de 5 produtos atingido ou produto já favoritado.',
  })
  async addProductToFavorites(
    @Param('userId') userId: string,
    @Param('productId') productId: string
  ) {
    return this.FavoriteService.addProductToFavorites(userId, productId)
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Obter a lista de favoritos de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de favoritos retornada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Lista não encontrada.' })
  async getUserFavorites(@Param('userId') userId: string) {
    return this.FavoriteService.getUserFavorites(userId)
  }

  @Delete(':userId/product/:productId')
  @ApiOperation({ summary: 'Remover um produto dos favoritos' })
  @ApiResponse({
    status: 200,
    description: 'Produto removido dos favoritos com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Lista ou produto não encontrado.' })
  async removeProductFromFavorites(
    @Param('userId') userId: string,
    @Param('productId') productId: string
  ) {
    return this.FavoriteService.removeProductFromFavorites(userId, productId)
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Deletar a lista de favoritos de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de favoritos deletada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Lista não encontrada.' })
  async deleteFavoriteList(@Param('userId') userId: string) {
    return this.FavoriteService.deleteFavoriteList(userId)
  }
}

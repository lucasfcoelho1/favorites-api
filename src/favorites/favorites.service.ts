import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async createUniqueFavoriteList(
    userId: string,
    title: string,
    description?: string
  ) {
    const existingList = await this.prisma.favoriteList.findUnique({
      where: { userId },
    })

    if (existingList) {
      throw new BadRequestException(
        'o usuário já tem uma lista, não é possível criar outra'
      )
    }

    return this.prisma.favoriteList.create({
      data: { userId, title, description },
    })
  }

  async addProductToFavorites(userId: string, productId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('usuário não encontrado')
    }

    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
      include: { favoriteProducts: true },
    })

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new NotFoundException('produto não encontrado')
    }

    if (!favoriteList) {
      throw new NotFoundException('lista não encontrada')
    }

    if (favoriteList.favoriteProducts.length >= 5) {
      throw new BadRequestException('limite de 5 produtos atingido')
    }

    const existingFavorite = favoriteList.favoriteProducts.find(
      (fav) => fav.productId === productId
    )
    if (existingFavorite) {
      throw new BadRequestException('produto já favoritado')
    }

    return this.prisma.favoriteProduct.create({
      data: {
        favoriteListId: favoriteList.id,
        productId,
      },
    })
  }

  async getUserFavorites(userId: string) {
    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
      include: { favoriteProducts: { include: { product: true } } },
    })

    if (!favoriteList) {
      throw new NotFoundException('lista não encontrada')
    }

    return favoriteList
  }

  async removeProductFromFavorites(userId: string, productId: string) {
    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
      include: { favoriteProducts: true },
    })

    if (!favoriteList) {
      throw new NotFoundException('lista não encontrada')
    }

    const favoriteProduct = favoriteList.favoriteProducts.find(
      (fav) => fav.productId === productId
    )
    if (!favoriteProduct) {
      throw new NotFoundException('produto não está na lista')
    }

    return this.prisma.favoriteProduct.delete({
      where: { id: favoriteProduct.id },
    })
  }

  async deleteFavoriteList(userId: string) {
    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
    })

    if (!favoriteList) {
      throw new NotFoundException('lista não encontrada')
    }

    await this.prisma.favoriteProduct.deleteMany({
      where: { favoriteListId: favoriteList.id },
    })

    return this.prisma.favoriteList.delete({ where: { id: favoriteList.id } })
  }
}

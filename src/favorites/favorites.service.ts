import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../infra/database/prisma/prisma.service'
import { z } from 'zod'

const favoriteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string(),
  favoriteProducts: z
    .array(
      z.object({
        id: z.string(),
        favoriteListId: z.string(),
        productId: z.string(),
        product: z.object({
          id: z.string(),
          name: z.string(),
          image: z.string(),
          price: z.string(),
        }),
      })
    )
    .optional(),
})

const favoriteProductSchema = z.object({
  id: z.string(),
  favoriteListId: z.string(),
  productId: z.string(),
  product: z
    .object({
      id: z.string(),
      name: z.string(),
      image: z.string(),
      price: z.string(),
    })
    .optional(),
  favoriteProducts: z
    .array(
      z.object({
        id: z.string(),
        favoriteListId: z.string(),
        productId: z.string(),
        product: z.object({
          id: z.string(),
          name: z.string(),
          image: z.string(),
          price: z.string(),
        }),
      })
    )
    .optional(),
})

export type FavoriteProductSchema = z.infer<typeof favoriteProductSchema>
export type FavoriteSchema = z.infer<typeof favoriteSchema>

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async createUniqueFavoriteList(
    userId: string,
    title: string,
    description: string
  ): Promise<FavoriteSchema> {
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

  async addProductToFavorites(
    userId: string,
    productId: string
  ): Promise<FavoriteProductSchema> {
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

  async getUserFavorites(userId: string): Promise<FavoriteSchema> {
    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
      include: { favoriteProducts: { include: { product: true } } },
    })

    if (!favoriteList) {
      throw new NotFoundException('lista não encontrada')
    }

    favoriteList.favoriteProducts = favoriteList.favoriteProducts || []

    return {
      id: favoriteList.id,
      userId: favoriteList.userId,
      title: favoriteList.title,
      description: favoriteList.description,
      favoriteProducts: favoriteList.favoriteProducts.map((fav) => ({
        id: fav.id,
        favoriteListId: fav.favoriteListId,
        productId: fav.productId,
        product: fav.product,
      })),
    }
  }

  async removeProductFromFavorites(
    userId: string,
    productId: string
  ): Promise<FavoriteProductSchema> {
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

  async deleteFavoriteList(userId: string): Promise<FavoriteSchema> {
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

import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { EnvService } from '@/env/env.service'
import { z } from 'zod'

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.string(),
  favorites: z.boolean().optional(),
})

export type ProductSchema = z.infer<typeof productSchema>

@Injectable()
export class ProductService {
  private API_URL: string

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    envService: EnvService
  ) {
    this.API_URL = envService.get('PRODUCTS_API_URL')
  }

  async getProducts(
    userId: string,
    limit: number = 10
  ): Promise<ProductSchema[]> {
    this.validateLimit(limit)

    const existingProducts = await this.findProductsInDatabase(userId, limit)

    if (existingProducts.length > 0) {
      return existingProducts
    }

    return this.fetchAndSaveProductsFromApi(userId, limit)
  }

  async getProductById(id: string, userId: string): Promise<ProductSchema> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        favorites: {
          where: {
            favoriteList: {
              userId: userId,
            },
          },
        },
      },
    })

    if (!product) {
      throw new HttpException('Produto não encontrado', HttpStatus.NOT_FOUND)
    }
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      favorites: product.favorites.length > 0,
    }
  }

  async deleteAllProducts(): Promise<any> {
    return this.prisma.product.deleteMany({})
  }

  async deleteProduct(id: string): Promise<ProductSchema> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new HttpException('Produto não encontrado', HttpStatus.NOT_FOUND)
    }

    return this.prisma.product.delete({
      where: { id },
    })
  }

  private validateLimit(limit: number): void {
    if (limit > 100) {
      throw new HttpException(
        'Limit não pode ser maior do que 100',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  private async findProductsInDatabase(
    userId: string,
    limit: number
  ): Promise<ProductSchema[]> {
    const products = await this.prisma.product.findMany({
      take: limit,
      include: {
        favorites: {
          where: {
            favoriteList: {
              userId: userId,
            },
          },
        },
      },
    })

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      isFavorite: product.favorites?.length > 0,
    }))
  }

  private async fetchAndSaveProductsFromApi(
    userId: string,
    limit: number
  ): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.httpService.get(this.API_URL))
      const products = response.data.slice(0, limit)

      await this.prisma.product.createMany({
        data: products.map((product) => ({
          name: product.title,
          image: product.image,
          price: product.price.toString(),
        })),
      })

      const savedProducts = await this.prisma.product.findMany({
        where: {
          name: {
            in: products.map((product) => product.title),
          },
        },
        include: {
          favorites: {
            where: {
              favoriteList: {
                userId: userId,
              },
            },
          },
        },
      })

      return savedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        isFavorite: product.favorites.length > 0,
      }))
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
      } else {
        throw new HttpException(
          'Erro desconhecido',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    }
  }
}

import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class ProductsService {
  private readonly API_URL = 'https://fakestoreapi.com/products'

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService
  ) {}

  async getProducts(limit: number = 10): Promise<any> {
    this.validateLimit(limit)

    const existingProducts = await this.findProductsInDatabase(limit)

    if (existingProducts.length > 0) {
      return existingProducts
    }

    return this.fetchAndSaveProductsFromApi(limit)
  }

  private validateLimit(limit: number): void {
    if (limit > 100) {
      throw new HttpException(
        'Limit não pode ser maior do que 100',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  private async findProductsInDatabase(limit: number): Promise<any[]> {
    return this.prisma.product.findMany({
      take: limit,
    })
  }

  private async fetchAndSaveProductsFromApi(limit: number): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.httpService.get(this.API_URL))
      const products = response.data.slice(0, limit)

      await this.prisma.product.createMany({
        data: products.map((product) => ({
          id: product.id,
          name: product.title,
          image: product.image,
          price: product.price,
        })),
      })

      return products
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
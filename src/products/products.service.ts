import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ProductsService {
  private API_URL

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.API_URL = this.configService.get<string>('API_URL')
  }

  async getProducts(limit: number = 10): Promise<any> {
    if (limit > 100) {
      throw new HttpException(
        'Limit não pode ser maior do que 100',
        HttpStatus.BAD_REQUEST
      )
    }

    try {
      const response = await firstValueFrom(this.httpService.get(this.API_URL))
      const products = response.data.slice(0, limit)

      return products
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
      } else {
        throw new HttpException(
          'Erro desconhecido - CÓDIGO: May the FORCE be with you :)',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    }
  }
}

import { Controller, Get, Query } from '@nestjs/common'
import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //procurar offset
  @Get()
  async getProducts(@Query('limit') limit?: number) {
    return this.productsService.getProducts(limit)
  }
}

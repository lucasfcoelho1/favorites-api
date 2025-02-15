import { ProductService } from '@/product/product.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'

import { AuthGuard } from '@nestjs/passport'

@Controller('/products')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private readonly ProductService: ProductService) {}

  @Get('/user/:userId')
  async getProducts(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return this.ProductService.getProducts(userId, limit)
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.ProductService.deleteProduct(id)
  }

  @Delete()
  async deleteAllProducts() {
    return this.ProductService.deleteAllProducts()
  }
}

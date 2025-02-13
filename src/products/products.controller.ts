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
import { ProductsService } from './products.service'
import { AuthGuard } from '@nestjs/passport'

@Controller('/products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //procurar offset
  @Get('/user/:userId')
  async getProducts(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return this.productsService.getProducts(userId, limit)
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id)
  }

  @Delete()
  async deleteAllProducts() {
    return this.productsService.deleteAllProducts()
  }
}

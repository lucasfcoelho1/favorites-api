import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'
import { PrismaService } from '@/prisma/prisma.service'

@Module({
  imports: [HttpModule],
  providers: [ProductsService, PrismaService],
  controllers: [ProductsController],
})
export class ProductsModule {}

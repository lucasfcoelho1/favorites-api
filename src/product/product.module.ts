import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ProductService } from './product.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { EnvService } from '@/env/env.service'
import { ProductController } from '@/infra/http/controllers/product.controller'

@Module({
  imports: [HttpModule],
  providers: [ProductService, PrismaService, EnvService],
  controllers: [ProductController],
})
export class ProductModule {}

import { Module } from '@nestjs/common'
import { FavoriteService } from './favorite.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { FavoriteController } from '../infra/http/controllers/favorite.controller'

@Module({
  providers: [FavoriteService, PrismaService],
  controllers: [FavoriteController],
})
export class FavoriteModule {}

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './infra/database/prisma/prisma.service'
import { envSchema } from '@/env/env'
import { AuthModule } from './infra/auth/auth.module'
import { CreateAccountController } from './infra/http/controllers/account.controller'
import { AuthenticateController } from './infra/http/controllers/authenticate.controller'
import { ProductModule } from './product/product.module'
import { EnvModule } from './env/env.module'
import { FavoriteModule } from './favorite/favorite.module'
import { FavoriteController } from './infra/http/controllers/favorite.controller'
import { FavoriteService } from './favorite/favorite.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    ProductModule,
    FavoriteModule,
    EnvModule,
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    FavoriteController,
  ],
  providers: [PrismaService, FavoriteService],
})
export class AppModule {}

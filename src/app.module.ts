import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './infra/database/prisma/prisma.service'
import { envSchema } from '@/env/env'
import { AuthModule } from './infra/auth/auth.module'
import { CreateAccountController } from './infra/http/controllers/account.controller'
import { AuthenticateController } from './infra/http/controllers/authenticate.controller'
import { ProductsModule } from './products/products.module'
import { FavoritesModule } from './favorites/favorites.module'
import { FavoritesController } from './favorites/favorites.controller'
import { FavoritesService } from './favorites/favorites.service'
import { EnvModule } from './env/env.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    ProductsModule,
    FavoritesModule,
    EnvModule,
  ],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    FavoritesController,
  ],
  providers: [PrismaService, FavoritesService],
})
export class AppModule {}

import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../../src/app.module'
import { PrismaService } from '../../src/infra/database/prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'

describe('Favorites (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userId: string
  let authToken: string
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()

    // add
    const userResponse = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'Lucas Coelho',
        email: 'lu@email.com',
        passwordHash: '123456',
      })

    userId = userResponse.body.id

    // auth
    const authResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'lu@email.com',
        passwordHash: '123456',
      })

    authToken = authResponse.body.access_token
  })

  it(`E2E - CRIAR NOVA LISTA DE FAVORITOS
    -> deve criar usuário
    -> logar com usuário
    -> deve criar lista
    -> deve retornar 201 `, async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: 'lu@email.com',
      },
    })
    const response = await request(app.getHttpServer())
      .post(`/favorite/user/${user?.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Lista de Favoritos',
        description: 'Lista de favoritos do Lucas',
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('title', 'Lista de Favoritos')
    expect(response.body).toHaveProperty(
      'description',
      'Lista de favoritos do Lucas'
    )
  })

  it(`E2E - ADICIONAR PRODUTO A LISTA DE FAVORITOS
    -> deve criar usuário
    -> logar com usuário
    -> deve adicionar um produto a uma lista de favoritos
    -> deve retornar 201 `, async () => {
    const user = await prisma.user.findUnique({
      where: {
        email: 'lu@email.com',
      },
    })

    const favoriteList = await prisma.favoriteList.findUnique({
      where: {
        userId: user?.id,
      },
      include: { favoriteProducts: true },
    })

    const product = await prisma.product.create({
      data: {
        name: 'Product 1',
        image: 'http://image.com',
        price: '10.00',
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/favorite/${user?.id}/product/${product.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        userId: user?.id,
        productId: product.id,
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('productId', product.id)
  })

  it('should return 404 when trying to get a non-existent favorite list', async () => {
    const response = await request(app.getHttpServer())
      .get(`/favorite/user/worng-user-id`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.status).toBe(404)
  })
})

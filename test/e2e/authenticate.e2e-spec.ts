import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test(`E2E - AUTENTICAR JWT LOGIN
    -> deve criar usuario
    -> deve logar com usuario
    -> deve retornar Token JWT`, async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'Lucas Coelho',
        email: 'lu@email.com',
        passwordHash: '123456',
      })

    const response = await request(app.getHttpServer()).post('/sessions').send({
      email: 'lu@email.com',
      passwordHash: '123456',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      access_token: expect.any(String),
    })
  })
})

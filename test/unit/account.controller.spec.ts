import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateAccountController } from '@/infra/http/controllers/account.controller'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { ConflictException, HttpException, HttpStatus } from '@nestjs/common'
import { faker } from '@faker-js/faker'

describe('CreateAccountController', () => {
  let controller: CreateAccountController
  let prisma: PrismaService

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
        findMany: vi.fn(),
      },
    } as unknown as PrismaService

    controller = new CreateAccountController(prisma)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deve estar definido', () => {
    expect(controller).toBeDefined()
  })

  describe('handle', () => {
    it('deve criar um novo usuário', async () => {
      const userId = faker.string.uuid()
      const name = faker.person.fullName()
      const email = faker.internet.email()
      const passwordHash = faker.internet.password()

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)
      vi.spyOn(prisma.user, 'create').mockResolvedValue({
        id: userId,
        name,
        email,
        passwordHash: await hash(passwordHash, 8),
      })

      const result = await controller.handle({ name, email, passwordHash })
      expect(result).toBeUndefined()
    })

    it('deve lançar uma exceção se o usuário já existir', async () => {
      const user = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: faker.internet.password(),
      }
      const email = faker.internet.email()

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user)

      await expect(
        controller.handle({
          name: faker.person.fullName(),
          email,
          passwordHash: faker.internet.password(),
        })
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('getUser', () => {
    it('deve retornar um usuário pelo ID', async () => {
      const userId = faker.string.uuid()
      const user = {
        id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
      }

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user)

      const result = await controller.getUser(userId)
      expect(result).toStrictEqual(user)
    })

    it('deve lançar uma exceção se o usuário não for encontrado', async () => {
      const userId = faker.string.uuid()

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)

      await expect(controller.getUser(userId)).rejects.toThrow(HttpException)
    })
  })

  describe('updateUser', () => {
    it('deve atualizar um usuário existente', async () => {
      const userId = faker.string.uuid()
      const name = faker.person.fullName()
      const email = faker.internet.email()
      const passwordHash = faker.internet.password()
      const updatedUser = {
        id: userId,
        name,
        email,
        passwordHash: await hash(passwordHash, 10),
      }

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(updatedUser)
      vi.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser)

      const result = await controller.updateUser(userId, {
        name,
        email,
        passwordHash,
      })
      expect(result).toEqual(updatedUser)
    })

    it('deve lançar uma exceção se o usuário não for encontrado', async () => {
      const userId = faker.string.uuid()

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)

      await expect(
        controller.updateUser(userId, {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          passwordHash: faker.internet.password(),
        })
      ).rejects.toThrow(HttpException)
    })
  })

  describe('deleteUser', () => {
    it('deve deletar um usuário existente', async () => {
      const userId = faker.string.uuid()
      const user = {
        id: userId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: faker.internet.password(),
      }

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user)
      vi.spyOn(prisma.user, 'delete').mockResolvedValue(user)

      const result = await controller.deleteUser(userId)
      expect(result).toEqual({ message: 'Usuário deletado com sucesso' })
    })

    it('deve lançar uma exceção se o usuário não for encontrado', async () => {
      const userId = faker.string.uuid()

      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)

      await expect(controller.deleteUser(userId)).rejects.toThrow(HttpException)
    })
  })

  describe('deleteAllUsers', () => {
    it('deve deletar todos os usuários', async () => {
      vi.spyOn(prisma.user, 'deleteMany').mockResolvedValue({ count: 5 })

      const result = await controller.deleteAllUsers()
      expect(result).toEqual({
        message: 'Todos os usuários foram deletados com sucesso',
      })
    })
  })

  describe('listUsers', () => {
    it('deve retornar uma lista de usuários', async () => {
      const users = [
        {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          passwordHash: faker.internet.password(),
        },
      ]

      vi.spyOn(prisma.user, 'findMany').mockResolvedValue(users)

      const result = await controller.listUsers()
      expect(result).toEqual(users)
    })
  })
})

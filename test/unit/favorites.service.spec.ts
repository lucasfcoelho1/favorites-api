import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FavoritesService } from '../../src/favorites/favorites.service'
import { PrismaService } from '../../src/infra/database/prisma/prisma.service'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { faker } from '@faker-js/faker'

describe('FavoritesService', () => {
  let service: FavoritesService
  let prisma: PrismaService

  beforeEach(() => {
    prisma = new PrismaService()
    service = new FavoritesService(prisma)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createUniqueFavoriteList', () => {
    it('deve criar uma lista de favoritos única', async () => {
      const userId = faker.string.uuid()
      const title = faker.lorem.words()
      const description = faker.lorem.sentence()
      const favoriteListId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue(null)
      prisma.favoriteList.create = vi.fn().mockResolvedValue({
        id: favoriteListId,
        userId,
        title,
        description,
      })

      const result = await service.createUniqueFavoriteList(
        userId,
        title,
        description
      )
      expect(result.id).toStrictEqual(favoriteListId)
      expect(result).toHaveProperty('userId', userId)
      expect(result).toHaveProperty('title', title)
      expect(result).toHaveProperty('description', description)
    })

    it('deve lançar exceção se o usuário já tiver uma lista', async () => {
      const userId = faker.string.uuid()
      const title = faker.lorem.words()
      const description = faker.lorem.sentence()

      prisma.favoriteList.findUnique = vi
        .fn()
        .mockResolvedValue({ id: faker.string.uuid() })

      await expect(
        service.createUniqueFavoriteList(userId, title, description)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('addProductToFavorites', () => {
    const userId = faker.string.uuid()
    const productId = faker.string.uuid()
    const favoriteListId = faker.string.uuid()

    beforeEach(() => {
      prisma.user.findUnique = vi.fn().mockResolvedValue({})
      prisma.product.findUnique = vi.fn().mockResolvedValue({})
    })
    it('deve adicionar um produto aos favoritos', async () => {
      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue({
        id: favoriteListId,
        userId,
        favoriteProducts: [],
      })
      prisma.favoriteProduct.create = vi.fn().mockResolvedValue({
        id: faker.string.uuid(),
        favoriteListId,
        productId,
      })

      const result = await service.addProductToFavorites(userId, productId)
      expect(result).toHaveProperty('favoriteListId', favoriteListId)
      expect(result).toHaveProperty('productId', productId)
    })

    it('deve lançar exceção se a lista não for encontrada', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue(null)

      await expect(
        service.addProductToFavorites(userId, productId)
      ).rejects.toThrow(NotFoundException)
    })

    it('deve lançar exceção se o limite de produtos for atingido', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue({
        id: faker.string.uuid(),
        userId,
        favoriteProducts: Array(5).fill({ productId: faker.string.uuid() }),
      })

      await expect(
        service.addProductToFavorites(userId, productId)
      ).rejects.toThrow(BadRequestException)
    })

    it('deve lançar exceção se o produto já estiver favoritado', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue({
        id: faker.string.uuid(),
        userId,
        favoriteProducts: [{ productId }],
      })

      await expect(
        service.addProductToFavorites(userId, productId)
      ).rejects.toThrow(BadRequestException)
    })

    it('deve lançar exceção se o usuário não for encontrado', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()

      prisma.user.findUnique = vi.fn().mockResolvedValue(null)

      await expect(
        service.addProductToFavorites(userId, productId)
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('getUserFavorites', () => {
    it('deve retornar a lista de favoritos do usuário', async () => {
      const userId = faker.string.uuid()
      const favoriteList = {
        id: faker.string.uuid(),
        userId,
        favoriteProducts: [
          {
            id: faker.string.uuid(),
            productId: faker.string.uuid(),
            product: {
              id: faker.string.uuid(),
              name: faker.commerce.productName(),
            },
          },
        ],
      }

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue(favoriteList)

      const result = await service.getUserFavorites(userId)
      expect(result).toEqual(favoriteList)
    })

    it('deve lançar exceção se a lista não for encontrada', async () => {
      const userId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue(null)

      await expect(service.getUserFavorites(userId)).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('removeProductFromFavorites', () => {
    it('deve remover um produto dos favoritos', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const favoriteProductId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue({
        id: faker.string.uuid(),
        userId,
        favoriteProducts: [{ id: favoriteProductId, productId }],
      })
      prisma.favoriteProduct.delete = vi
        .fn()
        .mockResolvedValue({ id: favoriteProductId })

      const result = await service.removeProductFromFavorites(userId, productId)
      expect(result).toHaveProperty('id', favoriteProductId)
    })

    it('deve lançar exceção se a lista não for encontrada', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue(null)

      await expect(
        service.removeProductFromFavorites(userId, productId)
      ).rejects.toThrow(NotFoundException)
    })

    it('deve lançar exceção se o produto não estiver na lista', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue({
        id: faker.string.uuid(),
        userId,
        favoriteProducts: [],
      })

      await expect(
        service.removeProductFromFavorites(userId, productId)
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('deleteFavoriteList', () => {
    it('deve deletar a lista de favoritos do usuário', async () => {
      const userId = faker.string.uuid()
      const favoriteListId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi
        .fn()
        .mockResolvedValue({ id: favoriteListId, userId })
      prisma.favoriteProduct.deleteMany = vi
        .fn()
        .mockResolvedValue({ count: 1 })
      prisma.favoriteList.delete = vi
        .fn()
        .mockResolvedValue({ id: favoriteListId })

      const result = await service.deleteFavoriteList(userId)
      expect(result).toHaveProperty('id', favoriteListId)
    })

    it('deve lançar exceção se a lista não for encontrada', async () => {
      const userId = faker.string.uuid()

      prisma.favoriteList.findUnique = vi.fn().mockResolvedValue(null)

      await expect(service.deleteFavoriteList(userId)).rejects.toThrow(
        NotFoundException
      )
    })
  })
})

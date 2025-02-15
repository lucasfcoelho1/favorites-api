import { describe, it, expect, beforeEach, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { FavoriteController } from '@/infra/http/controllers/favorite.controller'
import { FavoriteService } from '@/favorite/favorite.service'

describe('FavoriteController', () => {
  let controller: FavoriteController
  let service: FavoriteService

  beforeEach(() => {
    service = {
      createUniqueFavoriteList: vi.fn(),
      addProductToFavorites: vi.fn(),
      getUserFavorites: vi.fn(),
      removeProductFromFavorites: vi.fn(),
      deleteFavoriteList: vi.fn(),
    } as unknown as FavoriteService

    controller = new FavoriteController(service)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deve estar definido', () => {
    expect(controller).toBeDefined()
  })

  describe('createUniqueFavoriteList', () => {
    it('deve criar uma lista de favoritos única', async () => {
      const userId = faker.string.uuid()
      const title = faker.lorem.words()
      const description = faker.lorem.sentence()
      const favoriteList = {
        id: faker.string.uuid(),
        userId,
        title,
        description,
      }

      vi.spyOn(service, 'createUniqueFavoriteList').mockResolvedValue(
        favoriteList
      )

      const result = await controller.createUniqueFavoriteList(userId, {
        title,
        description,
      })
      expect(result).toEqual(favoriteList)
    })
  })

  describe('addProductToFavorites', () => {
    it('deve adicionar um produto aos favoritos', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const favoriteProduct = {
        id: faker.string.uuid(),
        favoriteListId: faker.string.uuid(),
        productId,
      }

      vi.spyOn(service, 'addProductToFavorites').mockResolvedValue(
        favoriteProduct
      )

      const result = await controller.addProductToFavorites(userId, productId)
      expect(result).toEqual(favoriteProduct)
    })
  })

  describe('removeProductFromFavorites', () => {
    it('deve remover um produto dos favoritos', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const favoriteProduct = {
        id: faker.string.uuid(),
        favoriteListId: faker.string.uuid(),
        productId,
      }

      vi.spyOn(service, 'removeProductFromFavorites').mockResolvedValue(
        favoriteProduct
      )

      const result = await controller.removeProductFromFavorites(
        userId,
        productId
      )
      expect(result).toEqual(favoriteProduct)
    })
  })

  describe('deleteFavoriteList', () => {
    it('deve deletar a lista de favoritos do usuário', async () => {
      const userId = faker.string.uuid()
      const favoriteList = {
        id: faker.string.uuid(),
        userId,
        title: faker.lorem.words(),
        description: faker.lorem.sentence(),
      }

      vi.spyOn(service, 'deleteFavoriteList').mockResolvedValue(favoriteList)

      const result = await controller.deleteFavoriteList(userId)
      expect(result).toEqual(favoriteList)
    })
  })
})

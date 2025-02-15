import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpService } from '@nestjs/axios'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { ProductsService } from '../../src/products/products.service'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import axios from 'axios'
import { faker } from '@faker-js/faker'
import { EnvService } from '@/env/env.service'
import { env } from 'process'

describe('ProductsService', () => {
  let service: ProductsService
  let prisma: PrismaService
  let httpService: HttpService

  beforeEach(() => {
    prisma = {
      product: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
      },
    } as unknown as PrismaService

    httpService = {
      get: vi.fn(),
    } as unknown as HttpService

    const envService = { get: vi.fn() } as unknown as EnvService
    service = new ProductsService(httpService, prisma, envService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('deve estar definido', () => {
    expect(service).toBeDefined()
  })

  describe('getProductById', () => {
    it('deve retornar um produto pelo ID com status de favorito false', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const productName = faker.commerce.productName()
      const productPrice = faker.commerce.price()
      const productImage = faker.image.url()
      const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        favorites: [],
      }
      vi.spyOn(prisma.product, 'findUnique').mockResolvedValue(product)

      const result = await service.getProductById(productId, userId)
      expect(result).toEqual({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        favorites: product.favorites.length > 0,
      })
    })

    it('deve retornar um produto pelo ID com status de favorito true', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const productName = faker.commerce.productName()
      const productPrice = faker.commerce.price()
      const productImage = faker.image.url()
      const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        favorites: [{ id: faker.string.uuid() }],
      }
      vi.spyOn(prisma.product, 'findUnique').mockResolvedValue(product)

      const result = await service.getProductById(productId, userId)
      expect(result).toEqual({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        favorites: product.favorites.length > 0,
      })
    })

    it('deve lançar uma exceção se o produto não for encontrado', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      vi.spyOn(prisma.product, 'findUnique').mockResolvedValue(null)

      await expect(service.getProductById(productId, userId)).rejects.toThrow(
        HttpException
      )
    })
  })

  describe('deleteProduct', () => {
    it('deve deletar um produto existente', async () => {
      const productId = faker.string.uuid()
      const product = {
        id: productId,
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        image: faker.image.url(),
      }

      vi.spyOn(prisma.product, 'findUnique').mockResolvedValue(product)
      vi.spyOn(prisma.product, 'delete').mockResolvedValue(product)

      const result = await service.deleteProduct(productId)
      expect(result).toEqual(product)
    })

    it('deve lançar uma exceção se o produto não for encontrado', async () => {
      const invalidProductId = faker.string.uuid()
      vi.spyOn(prisma.product, 'findUnique').mockResolvedValue(null)

      await expect(service.deleteProduct(invalidProductId)).rejects.toThrow(
        HttpException
      )
    })
  })

  describe('deleteAllProducts', () => {
    it('deve deletar todos os produtos', async () => {
      const deleteResult = { count: 5 }
      vi.spyOn(prisma.product, 'deleteMany').mockResolvedValue(deleteResult)

      const result = await service.deleteAllProducts()
      expect(result).toEqual(deleteResult)
      expect(prisma.product.deleteMany).toHaveBeenCalled()
    })
  })

  describe('getProducts', () => {
    it('deve retornar um array de produtos', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const product = [
        {
          id: productId,
          name: faker.commerce.productName(),
          price: faker.commerce.price(),
          image: faker.image.url(),
          isFavorite: false,
        },
      ]
      vi.spyOn(prisma.product, 'findMany').mockResolvedValue(product)

      expect(await service.getProducts(userId)).toStrictEqual(product)
    })

    it('deve retornar um array de produtos favoritados', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const product = [
        {
          id: productId,
          name: faker.commerce.productName(),
          price: faker.commerce.price(),
          image: faker.image.url(),
          isFavorite: false,
        },
      ]
      vi.spyOn(prisma.product, 'findMany').mockResolvedValue(product)

      expect(await service.getProducts(userId)).toStrictEqual(product)
    })

    it('deve lançar uma exceção se a lista de produtos estiver vazia', async () => {
      const userId = faker.string.uuid()
      vi.spyOn(prisma.product, 'findMany').mockResolvedValue([])

      await expect(service.getProducts(userId)).rejects.toThrow(HttpException)
    })
  })

  describe('validateLimit', () => {
    it('deve lançar uma exceção se o limite for maior que 100', () => {
      expect(() => service['validateLimit'](101)).toThrow(
        new HttpException(
          'Limit não pode ser maior do que 100',
          HttpStatus.BAD_REQUEST
        )
      )
    })

    it('não deve lançar uma exceção se o limite for menor ou igual a 100', () => {
      expect(() => service['validateLimit'](100)).not.toThrow()
    })
  })
})

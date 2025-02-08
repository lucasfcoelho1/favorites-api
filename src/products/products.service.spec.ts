import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpService } from '@nestjs/axios'
import { PrismaService } from '@/prisma/prisma.service'
import { ProductsService } from './products.service'
import { HttpException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'

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

    service = new ProductsService(httpService, prisma)
  })

  it('deve estar definido', () => {
    expect(service).toBeDefined()
  })

  describe('getProductById', () => {
    it('deve retornar um produto pelo ID com status de favorito false', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const productName = faker.commerce.productName()
      const productPrice = new Prisma.Decimal(faker.commerce.price())
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
        isFavorite: product.favorites.length > 0,
      })
    })

    it('deve retornar um produto pelo ID com status de favorito true', async () => {
      const userId = faker.string.uuid()
      const productId = faker.string.uuid()
      const productName = faker.commerce.productName()
      const productPrice = new Prisma.Decimal(faker.commerce.price())
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
        isFavorite: product.favorites.length > 0,
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

  describe('createProduct', () => {
    it('deve criar um novo produto', async () => {
      const storedProductId = faker.string.uuid()
      const createProductDto = {
        name: faker.commerce.productName(),
        price: new Prisma.Decimal(faker.commerce.price()),
        image: faker.image.url(),
      }
      const createdProduct = { id: storedProductId, ...createProductDto }
      vi.spyOn(prisma.product, 'create').mockResolvedValue(createdProduct)

      const result = await service.createProduct(createProductDto)
      expect(result).toEqual(createdProduct)
    })
  })

  describe('updateProduct', () => {
    const storedProductId = faker.string.uuid()
    const updateProductDto = {
      name: faker.commerce.productName(),
      price: new Prisma.Decimal(faker.commerce.price()),
      image: faker.image.url(),
    }
    it('deve atualizar um produto existente', async () => {
      const updatedProduct = { id: storedProductId, ...updateProductDto }
      vi.spyOn(prisma.product, 'findUnique').mockResolvedValue(updatedProduct)
      vi.spyOn(prisma.product, 'update').mockResolvedValue(updatedProduct)

      const result = await service.updateProduct(
        storedProductId,
        updateProductDto
      )
      expect(result).toEqual(updatedProduct)
    })

    it('deve lançar uma exceção se o produto não for encontrado', async () => {
      const invalidProductId = faker.string.uuid()
      vi.spyOn(prisma.product, 'findUnique').mockResolvedValue(null)

      await expect(
        service.updateProduct(invalidProductId, updateProductDto)
      ).rejects.toThrow(HttpException)
    })
  })

  describe('deleteProduct', () => {
    const storedProductId = faker.string.uuid()
    const storedProduct = {
      id: storedProductId,
      name: faker.commerce.productName(),
      price: new Prisma.Decimal(faker.commerce.price()),
      image: faker.image.url(),
    }
    it('deve deletar um produto existente', async () => {
      vi.spyOn(prisma.product, 'findUnique').mockResolvedValue(storedProduct)
      vi.spyOn(prisma.product, 'delete').mockResolvedValue(storedProduct)

      const result = await service.deleteProduct(storedProductId)
      expect(result).toEqual(storedProduct)
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
    })
  })
})

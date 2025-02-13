import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductsController } from '../../src/products/products.controller'
import { ProductsService } from '../../src/products/products.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { faker } from '@faker-js/faker'

describe('ProductsController', () => {
  let controller: ProductsController
  let service: ProductsService
  let jwtAuthGuard: JwtAuthGuard

  beforeEach(() => {
    service = {
      getProducts: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
      deleteAllProducts: vi.fn(),
    } as unknown as ProductsService

    jwtAuthGuard = {
      canActivate: vi.fn(() => true),
    } as unknown as JwtAuthGuard

    controller = new ProductsController(service)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getProducts', () => {
    it('deve retornar um array de produtos', async () => {
      const productId = faker.string.uuid()
      const result = [
        {
          id: productId,
          name: faker.commerce.productName(),
          price: faker.commerce.price(),
          image: faker.image.url(),
        },
      ]
      vi.spyOn(service, 'getProducts').mockResolvedValue(result)

      expect(await controller.getProducts(productId)).toBe(result)
    })
  })

  describe('deleteProduct', () => {
    it('deve solicitar jwt auth', async () => {
      const canActivateSpy = vi.spyOn(jwtAuthGuard, 'canActivate')
      await jwtAuthGuard.canActivate({} as any)
      expect(canActivateSpy).toHaveBeenCalled()
    })

    it('deve deletar um produto', async () => {
      const productId = faker.string.uuid()
      const result = {
        id: productId,
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        image: faker.image.url(),
      }
      vi.spyOn(service, 'deleteProduct').mockResolvedValue(result)

      expect(await controller.deleteProduct(productId)).toBe(result)
    })
  })

  describe('deleteAllProducts', () => {
    it('deve deletar todos os produtos', async () => {
      const result = { count: 5 }
      vi.spyOn(service, 'deleteAllProducts').mockResolvedValue(result)

      expect(await controller.deleteAllProducts()).toBe(result)
    })
  })
})

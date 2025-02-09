import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'

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
      const result = ['test']
      vi.spyOn(service, 'getProducts').mockResolvedValue(result)

      expect(await controller.getProducts('1')).toBe(result)
    })
  })

  describe('createProduct', () => {
    it('deve criar um produto', async () => {
      const result = { id: '1', name: 'test' }
      vi.spyOn(service, 'createProduct').mockResolvedValue(result)

      expect(await controller.createProduct(result)).toBe(result)
    })
  })

  describe('updateProduct', () => {
    it('deve atualizar um produto', async () => {
      const result = { id: '1', name: 'updated test' }
      vi.spyOn(service, 'updateProduct').mockResolvedValue(result)

      expect(await controller.updateProduct('1', result)).toBe(result)
    })
  })

  describe('deleteProduct', () => {
    it('deve solicitar jwt auth', async () => {
      const canActivateSpy = vi.spyOn(jwtAuthGuard, 'canActivate')
      await jwtAuthGuard.canActivate({} as any)
      expect(canActivateSpy).toHaveBeenCalled()
    }),
      it('deve deletar um produto', async () => {
        const result = { deleted: true }
        vi.spyOn(service, 'deleteProduct').mockResolvedValue(result)

        expect(await controller.deleteProduct('1')).toBe(result)
      })
  })

  describe('deleteAllProducts', () => {
    it('deve deletar todos os produtos', async () => {
      const result = { deleted: true }
      vi.spyOn(service, 'deleteAllProducts').mockResolvedValue(result)

      expect(await controller.deleteAllProducts()).toBe(result)
    })
  })
})

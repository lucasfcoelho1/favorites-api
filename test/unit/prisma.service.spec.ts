import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaClient } from '@prisma/client'

describe('PrismaService', () => {
  let prismaService: PrismaService

  beforeEach(() => {
    prismaService = new PrismaService()
  })

  it('deve estar definido', () => {
    expect(prismaService).toBeDefined()
  })

  describe('onModuleInit', () => {
    it('deve conectar ao banco de dados', async () => {
      const connectSpy = vi
        .spyOn(PrismaClient.prototype, '$connect')
        .mockResolvedValue(undefined)

      await prismaService.onModuleInit()

      expect(connectSpy).toHaveBeenCalled()
    })

    it('deve lançar uma exceção se a conexão falhar', async () => {
      const error = new Error('Connection failed')
      vi.spyOn(PrismaClient.prototype, '$connect').mockRejectedValue(error)

      await expect(prismaService.onModuleInit()).rejects.toThrow(
        'Connection failed'
      )
    })
  })

  describe('onModuleDestroy', () => {
    it('deve desconectar do banco de dados', async () => {
      const disconnectSpy = vi
        .spyOn(PrismaClient.prototype, '$disconnect')
        .mockResolvedValue(undefined)

      await prismaService.onModuleDestroy()

      expect(disconnectSpy).toHaveBeenCalled()
    })
  })
})

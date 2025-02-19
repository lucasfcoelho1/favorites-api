import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { z } from 'zod'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  passwordHash: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@ApiTags('sessions')
@Controller('sessions')
export class AuthenticateController {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  @ApiOperation({ summary: 'Autenticar um usuário' })
  @ApiResponse({ status: 201, description: 'Usuário autenticado com sucesso.' })
  @ApiResponse({
    status: 401,
    description: 'As credenciais do usuário não correspondem.',
  })
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, passwordHash } = body

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new UnauthorizedException(
        'As credenciais do usuário não correspondem. [email]'
      )
    }

    const isPasswordValid = await compare(passwordHash, user.passwordHash)

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'As credenciais do usuário não correspondem. [senha]'
      )
    }

    const accessToken = this.jwt.sign({ sub: user.id })

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  }
}

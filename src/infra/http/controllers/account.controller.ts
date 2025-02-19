import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
})

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
})

export type UserSchema = z.infer<typeof userSchema>
type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@ApiTags('accounts')
@Controller('accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  @ApiOperation({ summary: 'Criar uma nova conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso.' })
  @ApiResponse({
    status: 409,
    description: 'Usuário com o mesmo e-mail já existe.',
  })
  async handle(@Body() body: CreateAccountBodySchema) {
    const { name, email, passwordHash } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (userWithSameEmail) {
      throw new ConflictException('Usuário com o mesmo e-mail já existe.')
    }

    const hashedPassword = await hash(passwordHash, 8)

    await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
      },
    })
  }

  @Get('/user/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async getUser(@Param('id') id: string): Promise<UserSchema> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new HttpException('Usuario não encontrado', HttpStatus.NOT_FOUND)
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }

  @Put('/user/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar um usuário existente' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: Partial<CreateAccountBodySchema>
  ) {
    const { name, email, passwordHash } = body

    const data: Record<string, any> = {
      ...(name && { name }),
      ...(email && { email }),
      ...(passwordHash && { passwordHash: await hash(passwordHash, 10) }),
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new HttpException('Usuario não encontrado', HttpStatus.NOT_FOUND)
    }

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data,
    })

    return user
  }

  @Delete('/user/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar um usuário pelo ID' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async deleteUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new HttpException(
        'Impossível remover, usuario não encontrado',
        HttpStatus.NOT_FOUND
      )
    }
    await this.prisma.user.delete({
      where: { id },
    })

    return { message: 'Usuário deletado com sucesso' }
  }

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Todos os usuários foram deletados com sucesso.',
  })
  async deleteAllUsers() {
    await this.prisma.user.deleteMany()
    return { message: 'Todos os usuários foram deletados com sucesso' }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
  })
  async listUsers() {
    const users = await this.prisma.user.findMany()
    return users
  }
}

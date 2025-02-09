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
import { PrismaService } from '@/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { AuthGuard } from '@nestjs/passport'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
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

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new HttpException('Usuario não encontrado', HttpStatus.NOT_FOUND)
    }

    return user
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
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

    const user = await this.prisma.user.update({
      where: { id },
      data,
    })

    return user
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
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

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async listUsers() {
    const users = await this.prisma.user.findMany()
    return users
  }
}

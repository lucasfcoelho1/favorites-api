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
  UsePipes,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'

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
  async getUser(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    return user
  }

  @Put(':id')
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
  async deleteUser(@Param('id') id: string) {
    await this.prisma.user.delete({
      where: { id },
    })

    return { message: 'User deleted successfully' }
  }

  @Get()
  async listUsers() {
    const users = await this.prisma.user.findMany()
    return users
  }
}

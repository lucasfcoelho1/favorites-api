import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  // cria uma lista se o usuário não tiver uma
  async createFavoriteList(
    userId: string,
    title: string,
    description?: string
  ) {
    const existingList = await this.prisma.favoriteList.findUnique({
      where: { userId },
    });

    if (existingList) {
      throw new BadRequestException(
        "o usuário já tem uma lista, não é possível criar outra"
      );
    }

    console.log(userId);

    return this.prisma.favoriteList.create({
      data: { userId, title, description },
    });
  }

  // adiciona um produto à lista
  async addProductToFavorites(userId: string, productId: number) {
    productId = parseInt(productId as any, 10);

    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
      include: { favoriteProducts: true },
    });

    if (!favoriteList) {
      throw new NotFoundException("lista não encontrada");
    }

    if (favoriteList.favoriteProducts.length >= 5) {
      throw new BadRequestException("limite de 5 produtos atingido");
    }

    const existingFavorite = favoriteList.favoriteProducts.find(
      (fav) => fav.productId === productId
    );
    if (existingFavorite) {
      throw new BadRequestException("produto já favoritado");
    }

    return this.prisma.favoriteProduct.create({
      data: {
        favoriteListId: favoriteList.id,
        productId,
      },
    });
  }

  // retorna a lista de favoritos do usuário
  async getUserFavorites(userId: string) {
    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
      include: { favoriteProducts: { include: { product: true } } },
    });

    if (!favoriteList) {
      throw new NotFoundException("lista não encontrada");
    }

    return favoriteList;
  }

  // remove um produto da lista
  async removeProductFromFavorites(userId: string, productId: number) {
    productId = parseInt(productId as any, 10);

    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
      include: { favoriteProducts: true },
    });

    if (!favoriteList) {
      throw new NotFoundException("lista não encontrada");
    }

    const favoriteProduct = favoriteList.favoriteProducts.find(
      (fav) => fav.productId === productId
    );
    if (!favoriteProduct) {
      throw new NotFoundException("produto não está na lista");
    }

    return this.prisma.favoriteProduct.delete({
      where: { id: favoriteProduct.id },
    });
  }

  // apaga a lista e os produtos favoritados
  async deleteFavoriteList(userId: string) {
    const favoriteList = await this.prisma.favoriteList.findUnique({
      where: { userId },
    });

    if (!favoriteList) {
      throw new NotFoundException("lista não encontrada");
    }

    await this.prisma.favoriteProduct.deleteMany({
      where: { favoriteListId: favoriteList.id },
    });

    return this.prisma.favoriteList.delete({ where: { id: favoriteList.id } });
  }
}

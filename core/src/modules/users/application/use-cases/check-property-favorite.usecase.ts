import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';

@Injectable()
export class CheckPropertyFavoriteUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(propertyId: string): Promise<{
    isFavorite: boolean;
    favorites: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      favoriteData: any;
    }>;
  }> {
    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('JSON_CONTAINS(user.favoriteProperties, :propertyId, "$.propertyId")', {
        propertyId: JSON.stringify(propertyId),
      })
      .getMany();

    const favorites = users.map(user => {
      const favoriteData = user.favoriteProperties?.find(
        fav => fav.propertyId === propertyId,
      );
      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        favoriteData: favoriteData!,
      };
    });

    return {
      isFavorite: favorites.length > 0,
      favorites,
    };
  }
}

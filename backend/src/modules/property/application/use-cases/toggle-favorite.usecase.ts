import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyRepository } from '../../domain/property.repository';
import { Repository } from 'typeorm';
import { User } from '../../../users/domain/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ToggleFavoriteUseCase {
  constructor(
    private readonly propertyRepository: PropertyRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(propertyId: string, userId: string): Promise<{ isFavorited: boolean }> {
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const currentFavorites = property.favorites || [];
    const favoriteIndex = currentFavorites.findIndex(fav => fav.userId === userId);
    const isAdding = favoriteIndex < 0;

    if (isAdding) {
      property.favorites = [
        ...currentFavorites,
        { userId, addedAt: new Date() },
      ];
    } else {
      property.favorites = currentFavorites.filter(fav => fav.userId !== userId);
    }

    await this.propertyRepository.save(property);

    if (userId && userId !== 'anonymous') {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        const userFavorites = user.favoriteProperties || [];
        const userFavIndex = userFavorites.findIndex(fav => fav.propertyId === propertyId);
        if (isAdding) {
          if (userFavIndex < 0) {
            user.favoriteProperties = [
              ...userFavorites,
              { propertyId, addedAt: new Date() },
            ];
          }
        } else {
          if (userFavIndex >= 0) {
            user.favoriteProperties = userFavorites.filter(fav => fav.propertyId !== propertyId);
          }
        }
        await this.userRepository.save(user);
      }
    }

    return { isFavorited: isAdding };
  }
}

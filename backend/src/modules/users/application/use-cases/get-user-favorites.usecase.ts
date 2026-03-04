import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UserFavoriteData } from '../../../../shared/interfaces/user-favorites.interface';

@Injectable()
export class GetUserFavoritesUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: string): Promise<UserFavoriteData[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user.favoriteProperties || [];
  }
}

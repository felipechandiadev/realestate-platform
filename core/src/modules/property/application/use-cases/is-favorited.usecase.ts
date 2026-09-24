import { Injectable } from '@nestjs/common';
import { PropertyRepository } from '../../domain/property.repository';

@Injectable()
export class IsFavoritedUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(propertyId: string, userId: string): Promise<boolean> {
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property || !property.favorites) {
      return false;
    }
    return property.favorites.some(fav => fav.userId === userId);
  }
}

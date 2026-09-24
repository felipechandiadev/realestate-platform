import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { IsNull } from 'typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return user;
  }
}

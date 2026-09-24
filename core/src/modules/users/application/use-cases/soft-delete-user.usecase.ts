import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';

@Injectable()
export class SoftDeleteUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    await this.userRepo.softDelete(id);
  }
}

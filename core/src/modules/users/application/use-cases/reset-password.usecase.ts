import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { ResetPasswordDto } from '../../dto/user.dto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string, dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    await user.setPassword(dto.newPassword);
    await this.userRepo.save(user);
  }
}

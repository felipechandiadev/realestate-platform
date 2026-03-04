import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from '../../dto/user.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }
    await user.setPassword(dto.newPassword);
    await this.userRepo.save(user);
  }
}

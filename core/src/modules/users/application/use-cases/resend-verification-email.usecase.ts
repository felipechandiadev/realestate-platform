import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(email: string): Promise<{ token: string; expiresAt: Date; user: User }> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.emailVerified) {
      throw new BadRequestException('El correo de este usuario ya está verificado');
    }
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    user.emailVerificationToken = token;
    user.emailVerificationExpires = expiresAt;
    await this.userRepo.save(user as any);
    return { token, expiresAt, user };
  }
}
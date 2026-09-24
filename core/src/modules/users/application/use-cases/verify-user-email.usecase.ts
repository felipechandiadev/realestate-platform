import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class VerifyUserEmailUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(token: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { emailVerificationToken: token, emailVerified: false },
    });
    if (!user) {
      throw new NotFoundException('Token de verificación inválido o ya fue utilizado');
    }
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('El token de verificación ha expirado. Solicita uno nuevo.');
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    return this.userRepo.save(user as any);
  }
}

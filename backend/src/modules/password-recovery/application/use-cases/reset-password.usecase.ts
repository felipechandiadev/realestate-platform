import { PasswordResetTokenRepository } from '../../domain/password-reset-token.repository';
import { Repository } from 'typeorm';
import { User } from '../../../users/domain/user.entity';
import { PasswordResetToken } from '../../domain/password-reset-token.entity';

export class ResetPasswordUseCase {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(tokenRecord: PasswordResetToken, newPassword: string): Promise<{ email: string }> {
    tokenRecord.consumedAt = new Date();
    const tokenUser = await this.userRepository.findOne({ where: { id: tokenRecord.userId } });
    if (tokenUser) {
      await tokenUser.setPassword(newPassword);
      await this.userRepository.save(tokenUser);
    }
    await this.passwordResetTokenRepository.save(tokenRecord);
    return { email: tokenUser?.email || '' };
  }
}

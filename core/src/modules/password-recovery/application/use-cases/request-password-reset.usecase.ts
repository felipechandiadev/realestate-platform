import { PasswordResetTokenRepository } from '../../domain/password-reset-token.repository';
import { User } from '../../../users/domain/user.entity';
import { Repository, IsNull } from 'typeorm';
import { PasswordResetToken } from '../../domain/password-reset-token.entity';
import { randomBytes } from 'crypto';

export class RequestPasswordResetUseCase {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(
    user: User,
    expiresInMinutes: number,
    options: { ipAddress?: string; userAgent?: string },
  ): Promise<PasswordResetToken> {
    // mark existing tokens consumed
    await this.passwordResetTokenRepository.markExistingAsConsumed(user.id);

    const token = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const resetEntry = {
      id: undefined as any,
      userId: user.id,
      token,
      expiresAt,
      consumedAt: null,
      requestedIp: options.ipAddress ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PasswordResetToken;

    return await this.passwordResetTokenRepository.save(resetEntry);
  }
}

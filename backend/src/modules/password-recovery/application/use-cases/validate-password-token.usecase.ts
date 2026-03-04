import { PasswordResetTokenRepository } from '../../domain/password-reset-token.repository';
import { PasswordResetToken } from '../../domain/password-reset-token.entity';

export class ValidatePasswordTokenUseCase {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {}

  async execute(token: string): Promise<PasswordResetToken | null> {
    return await this.passwordResetTokenRepository.findByToken(token);
  }
}

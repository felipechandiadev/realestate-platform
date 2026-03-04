import { PasswordResetToken } from './password-reset-token.entity';

export abstract class PasswordResetTokenRepository {
  abstract save(token: PasswordResetToken): Promise<PasswordResetToken>;
  abstract findByToken(token: string): Promise<PasswordResetToken | null>;
  // note: updates are handled via save or explicit updateById
  abstract update(token: PasswordResetToken): Promise<PasswordResetToken>;
  /**
   * Mark all unconsumed tokens for a user as consumed
   */
  abstract markExistingAsConsumed(userId: string): Promise<void>;

  // additional helpers used by service
  abstract findOne(options: any): Promise<PasswordResetToken | null>;
  abstract find(options?: any): Promise<PasswordResetToken[]>;
  abstract createQueryBuilder(alias: string): any;
}

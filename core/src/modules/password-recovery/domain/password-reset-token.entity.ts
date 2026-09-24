// Domain model without decorators
export class PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  consumedAt?: Date | null;
  requestedIp?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

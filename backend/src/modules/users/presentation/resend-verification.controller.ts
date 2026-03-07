import { Controller, Post, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../domain/user.repository';
import { MailService } from '../../mail/application/mail.service';
import { ResendVerificationEmailUseCase } from '../application/use-cases/resend-verification-email.usecase';

@Controller('auth')
export class ResendVerificationController {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly mailService: MailService,
    private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase,
  ) {}

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      throw new BadRequestException('El correo electrónico es obligatorio.');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (user.emailVerified) {
      throw new BadRequestException('El correo ya está verificado.');
    }

    await this.resendVerificationEmailUseCase.execute(email);

    return { success: true, message: 'Correo de verificación reenviado.' };
  }
}
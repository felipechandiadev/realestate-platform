import { Injectable } from '@nestjs/common';
import { UsersService } from '../../../users/application/users.service';
import { CreateUserCommunityDto } from '../../../users/dto/create-user-community.dto';
import { MailService } from '../../../mail/application/mail.service';
import { ConfigService } from '@nestjs/config';
import { buildPortalVerifyEmailUrl } from '../../../mail/infrastructure/portal-public-url';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    createUserCommunityDto: CreateUserCommunityDto,
  ): Promise<{
    success: boolean;
    message: string;
    userId?: string;
    error?: string;
  }> {
    try {
      const user = await this.usersService.createCommunityUser(
        createUserCommunityDto.firstName,
        createUserCommunityDto.lastName,
        createUserCommunityDto.email,
        createUserCommunityDto.password,
      );

      const verificationLink = buildPortalVerifyEmailUrl(
        this.configService,
        user.emailVerificationToken!,
      );

      try {
        await this.mailService.sendEmailVerification(
          user.email,
          user.personalInfo?.firstName || 'Usuario',
          verificationLink,
        );
      } catch (mailError) {
        console.error('Error sending verification email:', mailError);
      }

      return {
        success: true,
        message:
          'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.',
        userId: user.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar usuario';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }
}

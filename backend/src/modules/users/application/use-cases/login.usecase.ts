import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { LoginDto } from '../../dto/user.dto';
import { UserStatus } from '../../domain/user.entity';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class LoginUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(dto: LoginDto): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException('Correo electrónico no verificado.');
      // throw new ForbiddenException({
      //   error: 'EMAIL_NOT_VERIFIED',
      //   message: 'Tu correo electrónico no ha sido verificado. Por favor, verifica tu correo.',
      // });
    }
    const valid = await user.validatePassword(dto.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario inactivo.');
    }
   
    return user;
  }
}

import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { LoginDto } from '../../dto/user.dto';
import { UserStatus } from '../../domain/user.entity';

@Injectable()
export class LoginUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(dto: LoginDto): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, deletedAt: null },
    });

    console.log('LoginUseCase - found user:', user); // Debugging log to inspect the user found by email

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    if (user.emailVerified === false) {
      console.log('LoginUseCase - email not verified for user:', user.email); // Log for unverified email case
      throw new HttpException({
        error: 'EMAIL_NOT_VERIFIED',
        message: 'Tu correo electrónico no ha sido verificado. Por favor, verifica tu correo.',
      }, HttpStatus.FORBIDDEN);
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

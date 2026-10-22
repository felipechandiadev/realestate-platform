import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { LoginDto } from '../../dto/user.dto';
import { UserRole, UserStatus } from '../../domain/user.entity';

@Injectable()
export class LoginUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(dto: LoginDto): Promise<any> {
    // password es select:false: hay que pedirlo explícitamente para validarlo.
    const user = await this.userRepo.findOneWithPassword({ email: dto.email });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    const isStaff = user.role === UserRole.ADMIN || user.role === UserRole.AGENT;
    if (!isStaff && user.emailVerified === false) {
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

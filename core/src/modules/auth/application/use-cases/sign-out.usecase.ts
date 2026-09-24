import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JweService } from '../../jwe/jwe.service';

@Injectable()
export class SignOutUseCase {
  constructor(private readonly jweService: JweService) {}

  async execute(authorizationHeader?: string) {
    if (!authorizationHeader) {
      throw new UnauthorizedException('Token requerido para cerrar sesión');
    }

    const token = authorizationHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    try {
      await this.jweService.decrypt(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    return {
      success: true,
      message: 'Sesión cerrada correctamente',
    };
  }
}

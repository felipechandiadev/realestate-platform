import { Injectable, ExecutionContext, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { resolveAuthAudience } from '../../application/auth-audience.util';
import { JweService } from '../../infrastructure/jwe/jwe.service';
import { SessionUserService } from '../../application/session-user.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jweService: JweService,
    private readonly reflector: Reflector,
    // Solo la instancia global (AuthModule) lo tiene; sin él la vía alternativa no se usa.
    @Optional() private readonly sessionUsers?: SessionUserService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // Solo aplica a HTTP (los gateways WebSocket tienen su propia autenticación)
    if (context.getType() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // Ruta pública: si viene un token se intenta poblar req.user, pero nunca se rechaza.
      const req = context.switchToHttp().getRequest();
      const authHeader = req?.headers?.authorization;
      if (authHeader && String(authHeader).startsWith('Bearer ')) {
        try {
          await this.authenticate(context);
        } catch {
          // token inválido o cuenta inactiva en ruta pública: se atiende como anónimo
          req.user = undefined;
        }
      }
      return true;
    }

    return this.authenticate(context);
  }

  private async authenticate(context: ExecutionContext): Promise<boolean> {
    // First attempt normal passport jwt flow
    try {
      const result = (await super.canActivate(context)) as boolean;
      return result;
    } catch (err) {
      // If passport flow fails with Unauthorized, try a manual decrypt fallback
      try {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        let token: string | null = null;

        if (authHeader && String(authHeader).startsWith('Bearer ')) {
          token = String(authHeader).substring(7).trim();
        }

        if (!token && req.headers && req.headers.cookie) {
          // parse cookies header to find access_token
          const cookieHeader = String(req.headers.cookie || '');
          const match = cookieHeader.match(/(?:^|; )access_token=([^;]+)/);
          if (match) token = decodeURIComponent(match[1]);
        }

        if (token && this.sessionUsers) {
          const payload = await this.jweService.decrypt(token);
          if (payload && payload.sub) {
            const role = await this.sessionUsers.assertActive(payload.sub);
            // attach user-like object to request so controllers can use it
            req.user = {
              id: payload.sub,
              email: payload.email,
              role,
              authAudience: resolveAuthAudience(payload),
            };
            return true;
          }
        }
      } catch (fallbackErr) {
        console.warn('[JwtAuthGuard] Manual decrypt fallback failed:', fallbackErr instanceof Error ? fallbackErr.message : fallbackErr);
      }

      // Re-throw original error so the framework returns 401
      throw err;
    }
  }
}

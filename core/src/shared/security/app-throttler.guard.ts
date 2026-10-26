import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { isIP } from 'net';

/**
 * Cabecera con la IP del visitante que agregan el portal y el backoffice cuando
 * llaman a core desde su servidor (login de NextAuth, formularios públicos).
 * Solo se cree si la petición viene de una IP de confianza (`THROTTLE_SKIP_IPS`).
 */
export const CLIENT_IP_HEADER = 'x-client-ip';

/** IPs que no se limitan por defecto: llamadas internas (SSR / server actions en el mismo host). */
export const DEFAULT_THROTTLE_SKIP_IPS = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

/**
 * Lista de IPs exentas: `THROTTLE_SKIP_IPS` (separadas por coma) o, si no se
 * define, solo loopback. El portal y el backoffice llaman a core desde su
 * propio servidor Next.js; sin esta exención todos sus usuarios compartirían
 * la cuota de una sola IP.
 */
export function parseThrottleSkipIps(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const raw = env.THROTTLE_SKIP_IPS;
  if (raw === undefined) return [...DEFAULT_THROTTLE_SKIP_IPS];
  return raw
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
}

/**
 * ThrottlerGuard por IP del cliente. Con `trust proxy = 1` (nginx), `req.ip`
 * es la IP real enviada en X-Forwarded-For por el proxy.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  private readonly skipIps = new Set(parseThrottleSkipIps());

  private directIp(req: Record<string, any>): string {
    return String(req?.ip ?? req?.socket?.remoteAddress ?? 'unknown');
  }

  /** IP del visitante reenviada por un servidor de confianza, o null. */
  private forwardedClientIp(req: Record<string, any>): string | null {
    if (!this.skipIps.has(this.directIp(req))) return null;
    const raw = req?.headers?.[CLIENT_IP_HEADER];
    const value = (Array.isArray(raw) ? raw[0] : raw)?.toString().split(',')[0].trim();
    return value && isIP(value) ? value : null;
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return this.forwardedClientIp(req) ?? this.directIp(req);
  }

  /**
   * Se exime el tráfico interno (SSR del portal/backoffice) salvo cuando trae la
   * IP del visitante: así el login y los formularios públicos se limitan por
   * visitante aunque pasen por el servidor de Next.js.
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const req = context.switchToHttp().getRequest();
    if (this.forwardedClientIp(req)) return false;
    return this.skipIps.has(this.directIp(req));
  }
}

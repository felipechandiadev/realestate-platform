import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

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

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return String(req?.ip ?? req?.socket?.remoteAddress ?? 'unknown');
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const req = context.switchToHttp().getRequest();
    const ip = await this.getTracker(req);
    return this.skipIps.has(ip);
  }
}

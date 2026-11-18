import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AgentScope } from '../../../agent-keys/domain/agent-key.entity';

/** Zonas de la API a las que puede entrar un agente (el resto queda cerrado). */
const AGENT_ALLOWED_PREFIXES = ['/properties', '/multimedia', '/agent', '/property-types', '/mcp'];

/** /mcp solo reenvía a la API con la misma key: ahí se aplican permisos y restricciones por herramienta. */
const MCP_PATH = '/mcp';

export interface AgentContext {
  keyId: string;
  name: string;
  scopes: AgentScope[];
}

/** ¿El valor pedido para `status` deja la propiedad publicada? (acepta el código numérico 3 del backoffice). */
export function isPublishStatus(value: unknown): boolean {
  return value === 'PUBLISHED' || value === 3 || value === '3';
}

/** Lanza 403 si el agente intenta publicar sin el permiso `properties:publish`. */
export function assertAgentMayPublish(user: { agent?: AgentContext } | undefined, status: unknown): void {
  if (!user?.agent || !isPublishStatus(status)) return;
  if (!user.agent.scopes.includes(AgentScope.PROPERTIES_PUBLISH)) {
    throw new ForbiddenException(
      'Esta key de agente no tiene permiso para publicar (properties:publish). Deja la propiedad en REQUEST o PRE-APPROVED.',
    );
  }
}

/**
 * Restringe a los agentes: solo propiedades, multimedia y catálogos; sin borrar;
 * lectura / escritura / publicación según los permisos de su key. Las personas
 * (sin `req.user.agent`) pasan sin cambios.
 */
@Injectable()
export class AgentAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;
    const req = context.switchToHttp().getRequest();
    const agent: AgentContext | undefined = req.user?.agent;
    if (!agent) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const path: string = req.path || '';
    if (!AGENT_ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
      throw new ForbiddenException('Los agentes no tienen acceso a este recurso');
    }

    if (path === MCP_PATH) return true;

    const method = String(req.method).toUpperCase();
    if (method === 'DELETE') {
      throw new ForbiddenException('Los agentes no pueden eliminar');
    }
    const needed =
      method === 'GET' || method === 'HEAD' ? AgentScope.PROPERTIES_READ : AgentScope.PROPERTIES_WRITE;
    if (!agent.scopes.includes(needed)) {
      throw new ForbiddenException(`Esta key de agente no tiene el permiso ${needed}`);
    }

    // Cuerpos JSON: el multipart del create se revisa en el controller (aún no está parseado aquí).
    assertAgentMayPublish(req.user, req.body?.status);
    return true;
  }
}

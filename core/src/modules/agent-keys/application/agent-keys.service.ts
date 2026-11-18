import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import {
  User,
  UserRole,
  UserStatus,
} from '../../users/domain/user.entity';
import { AgentKey, AgentScope } from '../domain/agent-key.entity';

export const AGENT_KEY_PREFIX = 'rek_';
const PREFIX_LENGTH = 12;
/** Cada cuánto se actualiza `lastUsedAt` (evita una escritura por petición). */
const LAST_USED_THROTTLE_MS = 60_000;

/** Usuario con que actúa una petición hecha con una key de agente. */
export interface AgentPrincipal {
  id: string;
  email: string;
  role: UserRole;
  authAudience: 'staff';
  agent: { keyId: string; name: string; scopes: AgentScope[] };
}

export const isAgentToken = (token?: string | null): boolean =>
  !!token && token.startsWith(AGENT_KEY_PREFIX);

const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

@Injectable()
export class AgentKeysService {
  constructor(
    @InjectRepository(AgentKey) private readonly keys: Repository<AgentKey>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  /** Crea una key. Devuelve el valor en claro: no se puede volver a ver. */
  async create(input: {
    ownerId: string;
    name: string;
    scopes: AgentScope[];
    expiresAt?: Date | null;
  }): Promise<{ key: AgentKey; token: string }> {
    const name = input.name?.trim();
    if (!name) throw new BadRequestException('El nombre del agente es obligatorio');
    const scopes = [...new Set(input.scopes ?? [])];
    if (scopes.length === 0) {
      throw new BadRequestException('Indica al menos un permiso');
    }
    const valid = Object.values(AgentScope);
    const unknown = scopes.filter((s) => !valid.includes(s));
    if (unknown.length) {
      throw new BadRequestException(
        `Permisos no válidos: ${unknown.join(', ')}. Válidos: ${valid.join(', ')}`,
      );
    }
    // Escribir o publicar implica poder leer.
    if (!scopes.includes(AgentScope.PROPERTIES_READ)) {
      scopes.unshift(AgentScope.PROPERTIES_READ);
    }
    if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('La fecha de vencimiento ya pasó');
    }

    const token = AGENT_KEY_PREFIX + randomBytes(32).toString('base64url');
    const key = await this.keys.save(
      this.keys.create({
        name,
        ownerId: input.ownerId,
        keyPrefix: token.slice(0, PREFIX_LENGTH),
        keyHash: sha256(token),
        scopes,
        expiresAt: input.expiresAt ?? null,
        lastUsedAt: null,
        revokedAt: null,
      }),
    );
    return { key, token };
  }

  list(ownerId?: string): Promise<AgentKey[]> {
    return this.keys.find({
      where: ownerId ? { ownerId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async revoke(id: string, requester: { id: string; role: UserRole }): Promise<AgentKey> {
    const key = await this.keys.findOne({ where: { id } });
    if (!key) throw new NotFoundException('Agente no encontrado');
    if (key.ownerId !== requester.id) {
      throw new NotFoundException('Agente no encontrado');
    }
    if (!key.revokedAt) {
      key.revokedAt = new Date();
      await this.keys.save(key);
    }
    return key;
  }

  /** Valida la key y devuelve el usuario con que debe actuar la petición. */
  async authenticate(token: string): Promise<AgentPrincipal> {
    const invalid = () => new UnauthorizedException('Key de agente inválida');
    if (!isAgentToken(token) || token.length < PREFIX_LENGTH + 8) throw invalid();

    const key = await this.keys.findOne({
      where: { keyPrefix: token.slice(0, PREFIX_LENGTH) },
    });
    if (!key) throw invalid();

    const given = Buffer.from(sha256(token), 'hex');
    const stored = Buffer.from(key.keyHash, 'hex');
    if (given.length !== stored.length || !timingSafeEqual(given, stored)) {
      throw invalid();
    }
    if (key.revokedAt) throw new UnauthorizedException('La key del agente fue revocada');
    if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('La key del agente venció');
    }

    const owner = await this.users.findOne({
      where: { id: key.ownerId, deletedAt: IsNull() },
      select: { id: true, email: true, role: true, status: true },
    });
    if (!owner || owner.status !== UserStatus.ACTIVE || owner.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('El administrador dueño de esta key ya no está activo');
    }

    if (!key.lastUsedAt || Date.now() - key.lastUsedAt.getTime() > LAST_USED_THROTTLE_MS) {
      void this.keys.update(key.id, { lastUsedAt: new Date() }).catch(() => undefined);
    }

    return {
      id: owner.id,
      email: owner.email,
      role: owner.role,
      authAudience: 'staff',
      agent: { keyId: key.id, name: key.name, scopes: key.scopes },
    };
  }
}

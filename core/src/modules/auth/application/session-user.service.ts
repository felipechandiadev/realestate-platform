import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../users/domain/user.entity';

/** Tiempo que se reutiliza la consulta del usuario entre peticiones. */
export const SESSION_USER_CACHE_MS = 15_000;

type SessionUser = { role: UserRole; status: UserStatus };

/**
 * El token dura 12 h y trae el rol con que se emitió. En cada petición se
 * confirma en la base que el usuario siga existiendo y activo, y se usa su rol
 * actual: así desactivar, eliminar o cambiar el rol corta el acceso en segundos,
 * no al vencer el token.
 */
@Injectable()
export class SessionUserService {
  private readonly cache = new Map<string, { value: SessionUser | null; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  /** Devuelve el rol vigente o lanza 401 si el usuario ya no puede operar. */
  async assertActive(userId: string | undefined): Promise<UserRole> {
    if (!userId) throw new UnauthorizedException('Sesión inválida');
    const user = await this.load(userId);
    if (!user) throw new UnauthorizedException('Tu cuenta ya no existe. Vuelve a iniciar sesión.');
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tu cuenta está inactiva. Vuelve a iniciar sesión.');
    }
    return user.role;
  }

  /** Olvida el usuario en caché (tras cambiar su estado o rol en este mismo proceso). */
  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  private async load(userId: string): Promise<SessionUser | null> {
    const now = Date.now();
    const cached = this.cache.get(userId);
    if (cached && cached.expiresAt > now) return cached.value;

    const found = await this.users.findOne({
      where: { id: userId, deletedAt: IsNull() },
      select: { id: true, role: true, status: true },
    });
    const value = found ? { role: found.role, status: found.status } : null;
    this.cache.set(userId, { value, expiresAt: now + SESSION_USER_CACHE_MS });
    return value;
  }
}

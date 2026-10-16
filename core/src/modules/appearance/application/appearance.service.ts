import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appearance } from '../domain/appearance.entity';
import { AppearanceTemplate } from '../domain/appearance-template.entity';

const COLOR_FIELDS = ['primary', 'secondary', 'background', 'foreground', 'accent'] as const;
type ColorField = (typeof COLOR_FIELDS)[number];

const DEFAULTS: Record<ColorField, string> = {
  primary: '#1e73ae',
  secondary: '#00deef',
  background: '#ffffff',
  foreground: '#131615',
  accent: '#02578b',
};

const LABELS: Record<ColorField, string> = {
  primary: 'Primario',
  secondary: 'Secundario',
  background: 'Fondo',
  foreground: 'Texto',
  accent: 'Acento',
};

const SYSTEM_TEMPLATE_NAME = 'Bravo Schott';

function normalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(value.trim());
  if (!match) return null;
  const body = match[1];
  const full = body.length === 3 ? body.split('').map((char) => char + char).join('') : body;
  return `#${full.toLowerCase()}`;
}

function readColors(body: Record<string, unknown>, required: boolean): Record<ColorField, string> {
  const next = {} as Record<ColorField, string>;
  for (const field of COLOR_FIELDS) {
    if (!(field in body)) {
      if (required) {
        throw new BadRequestException(`${LABELS[field]} es obligatorio`);
      }
      continue;
    }
    const hex = normalizeHex(body[field]);
    if (!hex) {
      throw new BadRequestException(`${LABELS[field]} no es un color hexadecimal válido`);
    }
    next[field] = hex;
  }
  return next;
}

function readName(value: unknown): string {
  if (typeof value !== 'string') {
    throw new BadRequestException('El nombre de la plantilla es obligatorio');
  }
  const name = value.trim().slice(0, 80);
  if (name.length < 2) {
    throw new BadRequestException('El nombre de la plantilla debe tener al menos 2 caracteres');
  }
  return name;
}

@Injectable()
export class AppearanceService {
  constructor(
    @InjectRepository(Appearance)
    private readonly repository: Repository<Appearance>,
    @InjectRepository(AppearanceTemplate)
    private readonly templates: Repository<AppearanceTemplate>,
  ) {}

  async get(): Promise<Appearance> {
    return this.ensure();
  }

  async update(body: Record<string, unknown>): Promise<Appearance> {
    const current = await this.ensure();
    const next = readColors(body ?? {}, false);
    if (Object.keys(next).length > 0) {
      await this.repository.update(current.id, next);
    }
    return this.get();
  }

  async listTemplates(): Promise<AppearanceTemplate[]> {
    await this.ensureSystemTemplate();
    return this.templates.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async createTemplate(body: Record<string, unknown>): Promise<AppearanceTemplate> {
    await this.ensureSystemTemplate();
    const name = readName(body.name);
    await this.assertUniqueName(name);
    const colors = readColors(body, true);
    const last = await this.templates.find({ order: { sortOrder: 'DESC' }, take: 1 });
    return this.templates.save(
      this.templates.create({
        name,
        ...colors,
        isSystem: false,
        sortOrder: (last[0]?.sortOrder ?? 0) + 1,
      }),
    );
  }

  async renameTemplate(id: string, body: Record<string, unknown>): Promise<AppearanceTemplate> {
    const current = await this.findTemplate(id);
    if (current.isSystem) {
      throw new BadRequestException('La plantilla de sistema no se puede renombrar');
    }
    const name = readName(body.name);
    await this.assertUniqueName(name, id);
    await this.templates.update(id, { name });
    return this.findTemplate(id);
  }

  async deleteTemplate(id: string): Promise<{ id: string }> {
    const current = await this.findTemplate(id);
    if (current.isSystem) {
      throw new BadRequestException('La plantilla de sistema no se puede eliminar');
    }
    await this.templates.delete(id);
    return { id };
  }

  private async ensure(): Promise<Appearance> {
    const existing = await this.repository.find({ order: { createdAt: 'ASC' }, take: 1 });
    if (existing[0]) return existing[0];
    try {
      return await this.repository.save(this.repository.create(DEFAULTS));
    } catch {
      const again = await this.repository.find({ order: { createdAt: 'ASC' }, take: 1 });
      if (again[0]) return again[0];
      throw new Error('No se pudo inicializar portal_appearances');
    }
  }

  private async ensureSystemTemplate(): Promise<void> {
    const existing = await this.templates.findOne({ where: { isSystem: true } });
    if (existing) return;
    await this.templates.save(
      this.templates.create({
        name: SYSTEM_TEMPLATE_NAME,
        ...DEFAULTS,
        isSystem: true,
        sortOrder: 0,
      }),
    );
  }

  private async findTemplate(id: string): Promise<AppearanceTemplate> {
    const current = await this.templates.findOne({ where: { id } });
    if (!current) throw new NotFoundException('Plantilla no encontrada');
    return current;
  }

  private async assertUniqueName(name: string, ignoreId?: string): Promise<void> {
    const match = await this.templates
      .createQueryBuilder('template')
      .where('LOWER(template.name) = LOWER(:name)', { name })
      .andWhere(ignoreId ? 'template.id != :ignoreId' : '1=1', { ignoreId })
      .getOne();
    if (match) {
      throw new BadRequestException('Ya existe una plantilla con ese nombre');
    }
  }
}

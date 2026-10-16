import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MultimediaService } from '../../multimedia/application/multimedia.service';
import { PortalFooter } from '../domain/portal-footer.entity';
import { applyFooterMenu, DEFAULT_FOOTER_MENU } from '../portal-footer.defaults';

function asBool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

function asLabel(value: unknown, fallback: string, max = 80): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().slice(0, max);
  return trimmed || fallback;
}

const BOOL_FIELDS = [
  'showCompany',
  'showAddress',
  'showPhone',
  'showHours',
  'showMail',
  'showSocial',
  'showPartnerships',
  'showFaqs',
  'showCopyright',
] as const;

@Injectable()
export class PortalFooterService {
  constructor(
    @InjectRepository(PortalFooter)
    private readonly repository: Repository<PortalFooter>,
    private readonly multimediaService: MultimediaService,
  ) {}

  async get(): Promise<PortalFooter> {
    const current = await this.ensure();
    return {
      ...current,
      menuItems: applyFooterMenu(current.menuItems),
    };
  }

  async update(
    body: Record<string, unknown>,
    files?: { logo?: Express.Multer.File[] },
  ): Promise<PortalFooter> {
    const current = await this.ensure();
    const next: Partial<PortalFooter> = {};

    for (const field of BOOL_FIELDS) {
      const value = asBool(body[field]);
      if (value !== undefined) next[field] = value;
    }

    if (typeof body.menuTitle === 'string') next.menuTitle = asLabel(body.menuTitle, 'Menu');
    if (typeof body.contactTitle === 'string') next.contactTitle = asLabel(body.contactTitle, 'Contacto');
    if (typeof body.socialTitle === 'string') next.socialTitle = asLabel(body.socialTitle, 'Síguenos en redes sociales');
    if (typeof body.partnershipsTitle === 'string') {
      next.partnershipsTitle = asLabel(body.partnershipsTitle, 'Nuestras alianzas');
    }
    if (typeof body.faqsTitle === 'string') next.faqsTitle = asLabel(body.faqsTitle, 'FAQs');
    if (typeof body.copyrightSuffix === 'string') {
      next.copyrightSuffix = asLabel(body.copyrightSuffix, 'Todos los derechos reservados.', 120);
    }
    if (body.menuItems !== undefined) {
      next.menuItems = applyFooterMenu(body.menuItems);
    }

    const removeLogo = asBool(body.removeLogo);
    if (files?.logo?.[0]) {
      next.logoUrl = await this.multimediaService.uploadFileToPath(files.logo[0], 'web/footer-logos');
    } else if (removeLogo) {
      next.logoUrl = null;
    }

    await this.repository.update(current.id, next);
    return this.get();
  }

  private async ensure(): Promise<PortalFooter> {
    const existing = await this.repository.find({ order: { createdAt: 'ASC' }, take: 1 });
    if (existing[0]) return existing[0];
    try {
      return await this.repository.save(
        this.repository.create({
          logoUrl: null,
          showCompany: true,
          showAddress: true,
          showPhone: true,
          showHours: true,
          showMail: true,
          showSocial: true,
          showPartnerships: true,
          showFaqs: true,
          showCopyright: true,
          menuTitle: 'Menu',
          contactTitle: 'Contacto',
          socialTitle: 'Síguenos en redes sociales',
          partnershipsTitle: 'Nuestras alianzas',
          faqsTitle: 'FAQs',
          copyrightSuffix: 'Todos los derechos reservados.',
          menuItems: DEFAULT_FOOTER_MENU,
        }),
      );
    } catch {
      const again = await this.repository.find({ order: { createdAt: 'ASC' }, take: 1 });
      if (again[0]) return again[0];
      throw new Error('No se pudo inicializar portal_footers');
    }
  }
}

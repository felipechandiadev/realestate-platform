import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MultimediaService } from '../../multimedia/application/multimedia.service';
import { PortalHeader } from '../domain/portal-header.entity';
import {
  DEFAULT_ACCOUNT_ITEMS,
  DEFAULT_NAV_ITEMS,
  applyEnabledFlags,
} from '../portal-header.defaults';

function asBool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
}

function asLabel(value: unknown, fallback: string, max = 40): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().slice(0, max);
  return trimmed || fallback;
}

@Injectable()
export class PortalHeaderService {
  constructor(
    @InjectRepository(PortalHeader)
    private readonly repository: Repository<PortalHeader>,
    private readonly multimediaService: MultimediaService,
  ) {}

  async get(): Promise<PortalHeader> {
    const current = await this.ensure();
    return {
      ...current,
      navItems: applyEnabledFlags(DEFAULT_NAV_ITEMS, current.navItems),
      accountItems: applyEnabledFlags(DEFAULT_ACCOUNT_ITEMS, current.accountItems),
    };
  }

  async update(
    body: Record<string, unknown>,
    files?: { logo?: Express.Multer.File[] },
  ): Promise<PortalHeader> {
    const current = await this.ensure();
    const next: Partial<PortalHeader> = {};

    const showCompanyName = asBool(body.showCompanyName);
    const showMail = asBool(body.showMail);
    const showPhone = asBool(body.showPhone);
    const showUf = asBool(body.showUf);
    const showLogin = asBool(body.showLogin);
    const showRegister = asBool(body.showRegister);
    const removeLogo = asBool(body.removeLogo);

    if (showCompanyName !== undefined) next.showCompanyName = showCompanyName;
    if (showMail !== undefined) next.showMail = showMail;
    if (showPhone !== undefined) next.showPhone = showPhone;
    if (showUf !== undefined) next.showUf = showUf;
    if (showLogin !== undefined) next.showLogin = showLogin;
    if (showRegister !== undefined) next.showRegister = showRegister;
    if (typeof body.ufLabel === 'string') next.ufLabel = asLabel(body.ufLabel, 'UF hoy');
    if (typeof body.loginLabel === 'string') next.loginLabel = asLabel(body.loginLabel, 'Ingresar');
    if (typeof body.registerLabel === 'string') next.registerLabel = asLabel(body.registerLabel, 'Registrarse');
    if (body.navItems !== undefined) {
      next.navItems = applyEnabledFlags(DEFAULT_NAV_ITEMS, body.navItems);
    }
    if (body.accountItems !== undefined) {
      next.accountItems = applyEnabledFlags(DEFAULT_ACCOUNT_ITEMS, body.accountItems);
    }

    if (files?.logo?.[0]) {
      next.logoUrl = await this.multimediaService.uploadFileToPath(files.logo[0], 'web/header-logos');
    } else if (removeLogo) {
      next.logoUrl = null;
    }

    await this.repository.update(current.id, next);
    return this.get();
  }

  private async ensure(): Promise<PortalHeader> {
    const existing = await this.repository.find({ order: { createdAt: 'ASC' }, take: 1 });
    if (existing[0]) return existing[0];
    return this.repository.save(
      this.repository.create({
        logoUrl: null,
        showCompanyName: true,
        showMail: true,
        showPhone: true,
        showUf: true,
        ufLabel: 'UF hoy',
        showLogin: true,
        showRegister: true,
        loginLabel: 'Ingresar',
        registerLabel: 'Registrarse',
        navItems: DEFAULT_NAV_ITEMS,
        accountItems: DEFAULT_ACCOUNT_ITEMS,
      }),
    );
  }
}

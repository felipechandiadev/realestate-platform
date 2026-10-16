import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FeaturedLayoutDesktop,
  PortalFeaturedSettings,
} from '../domain/portal-featured-settings.entity';

const LAYOUTS = new Set<FeaturedLayoutDesktop>(['band', 'grid']);
const MAX_PAGE_SIZE = 16;

export type PortalFeaturedSettingsDto = PortalFeaturedSettings & { pageSize: number };

@Injectable()
export class PortalFeaturedSettingsService {
  constructor(
    @InjectRepository(PortalFeaturedSettings)
    private readonly repository: Repository<PortalFeaturedSettings>,
  ) {}

  async get(): Promise<PortalFeaturedSettingsDto> {
    const settings = await this.ensure();
    return this.toDto(settings);
  }

  async update(body: {
    layoutDesktop?: string;
    gridColumns?: number;
    gridRows?: number;
  }): Promise<PortalFeaturedSettingsDto> {
    const current = await this.ensure();
    const patch: Partial<PortalFeaturedSettings> = {};

    const layout = body?.layoutDesktop?.trim() as FeaturedLayoutDesktop | undefined;
    if (layout && LAYOUTS.has(layout)) {
      patch.layoutDesktop = layout;
    }

    if (body?.gridColumns !== undefined && body.gridColumns !== null) {
      patch.gridColumns = this.clamp(Number(body.gridColumns), 1, 4, 3);
    }
    if (body?.gridRows !== undefined && body.gridRows !== null) {
      patch.gridRows = this.clamp(Number(body.gridRows), 1, 4, 2);
    }

    if (Object.keys(patch).length > 0) {
      await this.repository.update(current.id, patch);
    }
    return this.get();
  }

  private toDto(settings: PortalFeaturedSettings): PortalFeaturedSettingsDto {
    const cols = this.clamp(settings.gridColumns, 1, 4, 3);
    const rows = this.clamp(settings.gridRows, 1, 4, 2);
    return {
      ...settings,
      gridColumns: cols,
      gridRows: rows,
      pageSize: Math.min(MAX_PAGE_SIZE, cols * rows),
    };
  }

  private clamp(value: number, min: number, max: number, fallback: number): number {
    if (!Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  private async ensure(): Promise<PortalFeaturedSettings> {
    const existing = await this.repository.find({ order: { createdAt: 'ASC' }, take: 1 });
    if (existing[0]) return existing[0];
    return this.repository.save(
      this.repository.create({
        layoutDesktop: 'band',
        gridColumns: 3,
        gridRows: 2,
      }),
    );
  }
}

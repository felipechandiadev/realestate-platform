import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ListingsFilterVariant,
  PortalListingsSettings,
} from '../domain/portal-listings-settings.entity';

const VARIANTS = new Set<ListingsFilterVariant>(['classic', 'sidebar_v2']);

@Injectable()
export class PortalListingsSettingsService {
  constructor(
    @InjectRepository(PortalListingsSettings)
    private readonly repository: Repository<PortalListingsSettings>,
  ) {}

  async get(): Promise<PortalListingsSettings> {
    return this.ensure();
  }

  async update(body: { listingsFilterVariant?: string }): Promise<PortalListingsSettings> {
    const current = await this.ensure();
    const next = body?.listingsFilterVariant?.trim() as ListingsFilterVariant | undefined;
    if (next && VARIANTS.has(next)) {
      await this.repository.update(current.id, { listingsFilterVariant: next });
    }
    return this.get();
  }

  private async ensure(): Promise<PortalListingsSettings> {
    const existing = await this.repository.find({ order: { createdAt: 'ASC' }, take: 1 });
    if (existing[0]) return existing[0];
    return this.repository.save(
      this.repository.create({ listingsFilterVariant: 'classic' }),
    );
  }
}

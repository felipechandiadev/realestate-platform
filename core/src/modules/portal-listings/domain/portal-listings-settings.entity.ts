import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type ListingsFilterVariant = 'classic' | 'sidebar_v2';

@Entity('portal_listings_settings')
export class PortalListingsSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32, default: 'classic' })
  listingsFilterVariant: ListingsFilterVariant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

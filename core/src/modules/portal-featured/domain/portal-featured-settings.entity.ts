import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type FeaturedLayoutDesktop = 'band' | 'grid';

@Entity('portal_featured_settings')
export class PortalFeaturedSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 16, default: 'band' })
  layoutDesktop: FeaturedLayoutDesktop;

  @Column({ type: 'int', default: 3 })
  gridColumns: number;

  @Column({ type: 'int', default: 2 })
  gridRows: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

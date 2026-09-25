import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('slides')
export class Slide {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  multimediaUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  linkUrl: string;

  @Column({ type: 'int', default: 3 })
  duration: number;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'cta_label', type: 'varchar', length: 80, nullable: true })
  ctaLabel: string | null;

  @Column({ name: 'cta_style', type: 'varchar', length: 10, default: 'none' })
  ctaStyle: 'none' | 'button' | 'link';

  @Column({ name: 'text_align', type: 'varchar', length: 10, default: 'left' })
  textAlign: 'left' | 'center' | 'right';

  @Column({ name: 'overlay_opacity', type: 'smallint', default: 45 })
  overlayOpacity: number;

  @Column({ name: 'text_color', type: 'varchar', length: 7, nullable: true })
  textColor: string | null;

  @Column({ name: 'cta_button_bg_color', type: 'varchar', length: 7, nullable: true })
  ctaButtonBgColor: string | null;

  @Column({ name: 'cta_button_text_color', type: 'varchar', length: 7, nullable: true })
  ctaButtonTextColor: string | null;

  @Column({ name: 'cta_link_color', type: 'varchar', length: 7, nullable: true })
  ctaLinkColor: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
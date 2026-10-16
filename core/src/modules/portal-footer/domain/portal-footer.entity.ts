import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PortalFooterMenuItem } from '../portal-footer.defaults';

@Entity('portal_footers')
export class PortalFooter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string | null;

  @Column({ type: 'boolean', default: true })
  showCompany: boolean;

  @Column({ type: 'boolean', default: true })
  showAddress: boolean;

  @Column({ type: 'boolean', default: true })
  showPhone: boolean;

  @Column({ type: 'boolean', default: true })
  showHours: boolean;

  @Column({ type: 'boolean', default: true })
  showMail: boolean;

  @Column({ type: 'boolean', default: true })
  showSocial: boolean;

  @Column({ type: 'boolean', default: true })
  showPartnerships: boolean;

  @Column({ type: 'boolean', default: true })
  showFaqs: boolean;

  @Column({ type: 'boolean', default: true })
  showCopyright: boolean;

  @Column({ type: 'varchar', length: 80, default: 'Menu' })
  menuTitle: string;

  @Column({ type: 'varchar', length: 80, default: 'Contacto' })
  contactTitle: string;

  @Column({ type: 'varchar', length: 80, default: 'Síguenos en redes sociales' })
  socialTitle: string;

  @Column({ type: 'varchar', length: 80, default: 'Nuestras alianzas' })
  partnershipsTitle: string;

  @Column({ type: 'varchar', length: 80, default: 'FAQs' })
  faqsTitle: string;

  @Column({ type: 'varchar', length: 120, default: 'Todos los derechos reservados.' })
  copyrightSuffix: string;

  @Column({ type: 'json' })
  menuItems: PortalFooterMenuItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

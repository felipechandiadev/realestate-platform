import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PortalAccountItem, PortalNavItem } from '../portal-header.defaults';

@Entity('portal_headers')
export class PortalHeader {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string | null;

  @Column({ type: 'boolean', default: true })
  showCompanyName: boolean;

  @Column({ type: 'boolean', default: true })
  showMail: boolean;

  @Column({ type: 'boolean', default: true })
  showPhone: boolean;

  @Column({ type: 'boolean', default: true })
  showUf: boolean;

  @Column({ type: 'varchar', length: 40, default: 'UF hoy' })
  ufLabel: string;

  @Column({ type: 'boolean', default: true })
  showLogin: boolean;

  @Column({ type: 'boolean', default: true })
  showRegister: boolean;

  @Column({ type: 'varchar', length: 40, default: 'Ingresar' })
  loginLabel: string;

  @Column({ type: 'varchar', length: 40, default: 'Registrarse' })
  registerLabel: string;

  @Column({ type: 'json' })
  navItems: PortalNavItem[];

  @Column({ type: 'json' })
  accountItems: PortalAccountItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

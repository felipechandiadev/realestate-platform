import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('portal_appearances')
export class Appearance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 7, default: '#1e73ae' })
  primary: string;

  @Column({ type: 'varchar', length: 7, default: '#00deef' })
  secondary: string;

  @Column({ type: 'varchar', length: 7, default: '#ffffff' })
  background: string;

  @Column({ type: 'varchar', length: 7, default: '#131615' })
  foreground: string;

  @Column({ type: 'varchar', length: 7, default: '#02578b' })
  accent: string;

  @Column({ type: 'varchar', length: 7, default: '#ffffff' })
  topBarBackground: string;

  @Column({ type: 'varchar', length: 7, default: '#131615' })
  topBarForeground: string;

  @Column({ type: 'varchar', length: 7, default: '#ffffff' })
  navbarBackground: string;

  @Column({ type: 'varchar', length: 7, default: '#131615' })
  navbarForeground: string;

  @Column({ type: 'varchar', length: 7, default: '#131615' })
  footerBackground: string;

  @Column({ type: 'varchar', length: 7, default: '#ffffff' })
  footerForeground: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

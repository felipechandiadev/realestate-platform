import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('appearance_templates')
export class AppearanceTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'varchar', length: 7 })
  primary: string;

  @Column({ type: 'varchar', length: 7 })
  secondary: string;

  @Column({ type: 'varchar', length: 7 })
  background: string;

  @Column({ type: 'varchar', length: 7 })
  foreground: string;

  @Column({ type: 'varchar', length: 7 })
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

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

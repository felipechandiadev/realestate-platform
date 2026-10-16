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

  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

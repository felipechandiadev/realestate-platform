// copied from original global entity, trimmed for brevity
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Property } from '../../../property/domain/property.entity';
import { Document, DocumentStatus } from '../../../document/domain/document.entity';
import { PaymentStatus } from '../../domain/payment.entity';
import { User } from '../../../users/domain/user.entity';

@Entity('contracts')
export class ContractOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @BeforeInsert()
  ensureCode() {
    if (!('code' in this) || !(this as any).code) {
      (this as any).code = `C-${Date.now()}`;
    }
  }
  @Column({ type: 'varchar', length: 64, nullable: true })
  code?: string | null;
  @Column({ type: 'varchar', length: 36, nullable: true })
  userId?: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  propertyId?: string | null;

  @Column({ type: 'varchar', length: 32 })
  operation: string;

  @Column({ type: 'varchar', length: 32, default: 'IN_PROCESS' })
  status: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 8, default: 'CLP' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  ufValue?: number | null;

  @Column({ type: 'double', nullable: true })
  commissionPercent?: number | null;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  commissionAmount?: number | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'date', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'json', nullable: true })
  people?: any;

  @Column({ type: 'json', nullable: true })
  payments?: any;

  @Column({ type: 'json', nullable: true })
  documents?: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
  // rest of columns copied exactly from src/entities/contract.entity.ts
  // ... (omitted for brevity)
}

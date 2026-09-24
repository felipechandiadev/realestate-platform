import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentTypeOrmEntity } from '../../document-types/infrastructure/persistence/document-type.orm-entity';
import { Multimedia } from '../../multimedia/domain/multimedia.entity';
import { User } from '../../users/domain/user.entity';
import { ContractOrmEntity } from '../../contracts/infrastructure/persistence/contract.orm-entity';
import { Payment } from '../../contracts/domain/payment.entity';
import { PersonOrmEntity } from '../../person/infrastructure/persistence/person.orm-entity';

export enum DocumentStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
  RECIBIDO = 'RECIBIDO',
  REJECTED = 'REJECTED',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string; // Título del documento

  @ManyToOne(() => DocumentTypeOrmEntity)
  @JoinColumn({ name: 'documentTypeId' })
  documentType: DocumentTypeOrmEntity;

  @Column({ type: 'uuid' })
  documentTypeId: string;

  @ManyToOne(() => Multimedia, { nullable: true })
  @JoinColumn({ name: 'multimediaId' })
  multimedia?: Multimedia;

  @Column({ type: 'uuid', nullable: true })
  multimediaId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column({ type: 'uuid' })
  uploadedById: string;

  @ManyToOne(() => PersonOrmEntity, { nullable: true })
  @JoinColumn({ name: 'personId' })
  person?: PersonOrmEntity;

  @Column({ type: 'uuid', nullable: true })
  personId?: string;

  @ManyToOne(() => ContractOrmEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contractId' })
  contract?: ContractOrmEntity;

  @Column({ type: 'uuid', nullable: true })
  contractId?: string;

  @ManyToOne(() => Payment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'paymentId' })
  payment?: Payment;

  @Column({ type: 'uuid', nullable: true })
  paymentId?: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ nullable: true })
  notes?: string; // Notas adicionales

  @Column({ type: 'boolean', default: false })
  required: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

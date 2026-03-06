import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../users/domain/user.entity';
import { Multimedia } from '../../../multimedia/domain/multimedia.entity';

@Entity('persons')
export class PersonOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', nullable: true })
  city?: string;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  dni: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  maritalStatus?: string;

  @Column({ type: 'varchar', nullable: true })
  gender?: string;

  @Column({ type: 'varchar', nullable: true })
  nationality?: string;

  @Column({ type: 'varchar', nullable: true })
  profession?: string;

  @Column({ type: 'varchar', nullable: true })
  company?: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // DNI card relations
  @ManyToOne(() => Multimedia, { nullable: true })
  @JoinColumn({ name: 'dniCardFrontId' })
  dniCardFront?: Multimedia;

  @Column({ type: 'uuid', nullable: true })
  dniCardFrontId?: string;

  @ManyToOne(() => Multimedia, { nullable: true })
  @JoinColumn({ name: 'dniCardRearId' })
  dniCardRear?: Multimedia;

  @Column({ type: 'uuid', nullable: true })
  dniCardRearId?: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'date', nullable: true })
  verificationRequest: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

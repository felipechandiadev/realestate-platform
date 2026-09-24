import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Property } from '../../property/domain/property.entity';
import { MultimediaVariant } from '../../media-optimization/domain/multimedia-variant.entity';

export enum MultimediaFormat {
  IMG = 'IMG',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

export enum MultimediaType {
  AGENT_IMG = 'AGENT_IMG',
  DNI_FRONT = 'DNI_FRONT',
  DNI_REAR = 'DNI_REAR',
  SLIDE = 'SLIDE',
  LOGO = 'LOGO',
  STAFF = 'STAFF',
  PROPERTY_IMG = 'PROPERTY_IMG',
  PROPERTY_VIDEO = 'PROPERTY_VIDEO',
  PARTNERSHIP = 'PARTNERSHIP',
  DOCUMENT = 'DOCUMENT',
  TESTIMONIAL_IMG = 'TESTIMONIAL_IMG',
}

@Entity('multimedia')
export class Multimedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MultimediaFormat,
  })
  format: MultimediaFormat;

  @Column({
    type: 'enum',
    enum: MultimediaType,
  })
  type: MultimediaType;

  @Column()
  url: string;

  @Column({ nullable: true })
  seoTitle?: string;

  @Column()
  filename: string;

  @Column('int')
  fileSize: number;

  @Column({ type: 'int', nullable: true })
  originalSize?: number;

  @Column({ type: 'int', nullable: true })
  compressedSize?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  compressionRatio?: number;

  @Column({ type: 'int', nullable: true })
  width?: number;

  @Column({ type: 'int', nullable: true })
  height?: number;

  @OneToMany(() => MultimediaVariant, (variant) => variant.multimedia, {
    cascade: true,
  })
  variants?: MultimediaVariant[];

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => Property, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property?: Property;

  @Column({ type: 'uuid', nullable: true })
  propertyId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

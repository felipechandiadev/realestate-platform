import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Multimedia } from '../../multimedia/domain/multimedia.entity';

export enum VariantType {
  THUMBNAIL_SM = 'thumbnail_sm',
  THUMBNAIL_MD = 'thumbnail_md',
  THUMBNAIL_LG = 'thumbnail_lg',
  FULL = 'full',
  OG_IMAGE = 'og_image',
  HERO = 'hero',
  AVATAR_SM = 'avatar_sm',
  AVATAR_MD = 'avatar_md',
  AVATAR_LG = 'avatar_lg',
  SLIDE_MOBILE = 'slide_mobile',
  SLIDE_TABLET = 'slide_tablet',
  SLIDE_DESKTOP = 'slide_desktop',
  SLIDE_THUMBNAIL = 'slide_thumbnail',
  PROJECT_THUMB = 'project_thumb',
}

export enum ImageFormat {
  WEBP = 'webp',
  JPEG = 'jpeg',
  PNG = 'png',
}

@Entity('multimedia_variants')
@Index(['multimediaId'])
@Index(['variantType'])
export class MultimediaVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Multimedia, (multimedia) => multimedia.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'multimediaId' })
  multimedia: Multimedia;

  @Column({ type: 'uuid' })
  multimediaId: string;

  @Column({
    type: 'enum',
    enum: VariantType,
  })
  variantType: VariantType;

  @Column({
    type: 'enum',
    enum: ImageFormat,
  })
  format: ImageFormat;

  @Column('int')
  width: number;

  @Column('int')
  height: number;

  @Column('int')
  size: number;

  @Column()
  url: string;

  @Column()
  r2Key: string;

  @CreateDateColumn()
  createdAt: Date;
}

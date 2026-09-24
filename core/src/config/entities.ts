import { NotificationOrmEntity } from '../modules/notifications/infrastructure/persistence/notification.orm-entity';
import { DocumentTypeOrmEntity } from '../modules/document-types/infrastructure/persistence/document-type.orm-entity';
import { Identity } from '../modules/identities/domain/identity.entity';
import { PasswordResetTokenOrmEntity } from '../modules/password-recovery/infrastructure/persistence/password-reset-token.orm-entity';
import { User } from '../modules/users/domain/user.entity';
import { Document } from '../modules/document/domain/document.entity';
import { Multimedia } from '../modules/multimedia/domain/multimedia.entity';
import { MultimediaVariant } from '../modules/media-optimization/domain/multimedia-variant.entity';
import { AuditLog } from '../modules/audit/domain/audit-log.entity';
import { PersonOrmEntity } from '../modules/person/infrastructure/persistence/person.orm-entity';
import { Article } from '../modules/articles/domain/article.entity';
import { PropertyType } from '../modules/property-types/domain/property-type.entity';
import { ContractOrmEntity } from '../modules/contracts/infrastructure/persistence/contract.orm-entity';
import { Payment } from '../modules/contracts/domain/payment.entity';
import { Property } from '../modules/property/domain/property.entity';
import { AboutUs } from '../modules/about-us/domain/about-us.entity';
import { Testimonial } from '../modules/testimonials/domain/testimonial.entity';
import { TeamMember } from '../modules/team-members/domain/team-member.entity';
import { Slide } from '../modules/slide/domain/slide.entity';

export const entities = [
  NotificationOrmEntity,
  DocumentTypeOrmEntity,
  Identity,
  PasswordResetTokenOrmEntity,
  User,
  Document,
  Multimedia,
  MultimediaVariant,
  AuditLog,
  PersonOrmEntity,
  Article,
  PropertyType,
  ContractOrmEntity,
  Payment,
  Property,
  AboutUs,
  Testimonial,
  TeamMember,
  Slide,
];

export default entities;

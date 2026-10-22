import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ormConfig } from './config/ormconfig';
import { resolveEnvFilePath } from './config/env-file';
import { TeamMembersModule } from './modules/team-members/team-members.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { IdentitiesModule } from './modules/identities/identities.module';
import { PortalHeaderModule } from './modules/portal-header/portal-header.module';
import { PortalFooterModule } from './modules/portal-footer/portal-footer.module';
import { PortalListingsModule } from './modules/portal-listings/portal-listings.module';
import { PortalFeaturedModule } from './modules/portal-featured/portal-featured.module';
import { AppearanceModule } from './modules/appearance/appearance.module';
import { AboutUsModule } from './modules/about-us/about-us.module';
import { UsersModule } from './modules/users/users.module';
import { PropertyModule } from './modules/property/property.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { PersonModule } from './modules/person/person.module';
import { MultimediaModule } from './modules/multimedia/multimedia.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DocumentTypesModule } from './modules/document-types/document-types.module';
import { PropertyTypesModule } from './modules/property-types/property-types.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { DocumentModule } from './modules/document/document.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { SlideModule } from './modules/slide/slide.module';
import { FileUploadService } from './shared/services/file-upload.service';
import { ConfigModule as CustomConfigModule } from './modules/config/config.module';
import { MailModule } from './modules/mail/mail.module';
import { PasswordRecoveryModule } from './modules/password-recovery/password-recovery.module';
import { PredictModule } from './modules/predict/predict.module';
import { MediaOptimizationModule } from './modules/media-optimization/media-optimization.module';
// SchemaFixModule: runtime schema ALTERs were converted to migrations. The
// module is kept in the codebase for now but not imported here.
// import { SchemaFixModule } from './shared/init/schema-fix.module';
import { TestAdminModule } from './shared/init/test-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // En NODE_ENV=test carga .env.test (obligatorio, sin respaldo en .env)
      envFilePath: resolveEnvFilePath(),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: ormConfig,
      inject: [ConfigService],
    }),
    MulterModule.register({ storage: memoryStorage() }),
    TeamMembersModule,
    ArticlesModule,
    TestimonialsModule,
    IdentitiesModule,
    PortalHeaderModule,
    PortalFooterModule,
    PortalListingsModule,
    PortalFeaturedModule,
    AppearanceModule,
    AboutUsModule,
    UsersModule,
    PropertyModule,
    ContractsModule,
    PersonModule,
    MultimediaModule,
    NotificationsModule,
    DocumentTypesModule,
    PropertyTypesModule,
    AuthModule,
    AuditModule,
    DocumentModule,
    AnalyticsModule,
    SlideModule,
    CustomConfigModule,
    MailModule,
    PasswordRecoveryModule,
    PredictModule,
    MediaOptimizationModule,
    // SchemaFixModule removed from imports: prefer running DB migrations instead
    // Solo activo con NODE_ENV=test y ENABLE_TEST_ADMIN=true (ver test-admin.module.ts)
    TestAdminModule.register(),
    // CustomConfigModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FileUploadService,
    // Aplica @Exclude() (p. ej. User.password) a todas las respuestas.
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}

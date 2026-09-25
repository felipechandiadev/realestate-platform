/**
 * Minimal seed (MySQL): admin + catalogs + 2 properties, no images / R2.
 * Usage: npm run seed:minimal
 */
import { AppDataSource, initializeDataSource } from './seeder.config';
import * as bcrypt from 'bcrypt';
import { DeepPartial } from 'typeorm';
import {
  User,
  UserRole,
  UserStatus,
  Permission,
} from '../../src/modules/users/domain/user.entity';
import { PersonOrmEntity } from '../../src/modules/person/infrastructure/persistence/person.orm-entity';
import { Property } from '../../src/modules/property/domain/property.entity';
import { PropertyStatus } from '../../src/shared/enums/property-status.enum';
import { PropertyOperationType } from '../../src/shared/enums/property-operation-type.enum';
import { CurrencyPriceEnum } from '../../src/modules/property/domain/property.entity';
import { PropertyType } from '../../src/modules/property-types/domain/property-type.entity';
import { DocumentTypeOrmEntity } from '../../src/modules/document-types/infrastructure/persistence/document-type.orm-entity';
import { RegionEnum } from '../../src/shared/regions/regions.enum';
import { ComunaEnum } from '../../src/shared/regions/comunas.enum';

async function seedMinimal() {
  try {
    await initializeDataSource();

    console.log('Resetting schema (synchronize drop)...');
    await AppDataSource.synchronize(true);

    const userRepository = AppDataSource.getRepository(User);
    const personRepository = AppDataSource.getRepository(PersonOrmEntity);
    const propertyTypeRepository = AppDataSource.getRepository(PropertyType);
    const documentTypeRepository = AppDataSource.getRepository(DocumentTypeOrmEntity);
    const propertyRepository = AppDataSource.getRepository(Property);

    // ----- Admin + Person -----
    console.log('Creating admin user...');
    const adminUser = await userRepository.save(
      userRepository.create({
        username: 'admin',
        email: 'admin@re.cl',
        password: await bcrypt.hash('890890', 10),
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        permissions: Object.values(Permission),
        personalInfo: {
          firstName: 'Administrador',
          lastName: 'Sistema',
          phone: '+56 9 1234 5678',
        },
        emailVerified: true,
        lastLogin: new Date(),
      }),
    );

    const adminPerson = await personRepository.save(
      personRepository.create({
        name: 'Administrador Sistema',
        email: adminUser.email,
        phone: adminUser.personalInfo?.phone,
        verified: false,
        user: adminUser,
      }),
    );
    await userRepository.update(adminUser.id, { personId: adminPerson.id });
    console.log(`✓ Admin: ${adminUser.email} / 890890`);

    // ----- Property types -----
    console.log('Seeding property types...');
    const propertyTypes = await propertyTypeRepository.save([
      propertyTypeRepository.create({
        name: 'Casa',
        description: 'Vivienda unifamiliar independiente',
        hasBedrooms: true,
        hasBathrooms: true,
        hasBuiltSquareMeters: true,
        hasLandSquareMeters: true,
        hasParkingSpaces: true,
        hasFloors: false,
        hasConstructionYear: true,
      }),
      propertyTypeRepository.create({
        name: 'Apartamento',
        description: 'Departamento en condominio',
        hasBedrooms: true,
        hasBathrooms: true,
        hasBuiltSquareMeters: true,
        hasLandSquareMeters: false,
        hasParkingSpaces: true,
        hasFloors: true,
        hasConstructionYear: true,
      }),
      propertyTypeRepository.create({
        name: 'Terreno',
        description: 'Lote de terreno para construcción',
        hasBedrooms: false,
        hasBathrooms: false,
        hasBuiltSquareMeters: false,
        hasLandSquareMeters: true,
        hasParkingSpaces: false,
        hasFloors: false,
        hasConstructionYear: false,
      }),
      propertyTypeRepository.create({
        name: 'Comercial',
        description: 'Espacio comercial o retail',
        hasBedrooms: false,
        hasBathrooms: true,
        hasBuiltSquareMeters: true,
        hasLandSquareMeters: false,
        hasParkingSpaces: true,
        hasFloors: true,
        hasConstructionYear: true,
      }),
      propertyTypeRepository.create({
        name: 'Oficina',
        description: 'Oficina en centro de negocios',
        hasBedrooms: false,
        hasBathrooms: true,
        hasBuiltSquareMeters: true,
        hasLandSquareMeters: false,
        hasParkingSpaces: true,
        hasFloors: true,
        hasConstructionYear: true,
      }),
    ]);
    console.log(`✓ ${propertyTypes.length} property types`);

    const typeByName = Object.fromEntries(
      propertyTypes.map((t) => [t.name.toLowerCase(), t]),
    );

    // ----- Document types -----
    console.log('Seeding document types...');
    const documentTypes = await documentTypeRepository.save([
      documentTypeRepository.create({
        name: 'DNI Frontal',
        description: 'Documento Nacional de Identidad - Cara frontal',
        available: true,
      }),
      documentTypeRepository.create({
        name: 'DNI Trasero',
        description: 'Documento Nacional de Identidad - Cara trasera',
        available: true,
      }),
      documentTypeRepository.create({
        name: 'Contrato de Arriendo',
        description: 'Contrato de arrendamiento de propiedad',
        available: true,
      }),
      documentTypeRepository.create({
        name: 'Certificado de Dominio',
        description: 'Certificado de dominio vigente',
        available: true,
      }),
      documentTypeRepository.create({
        name: 'Comprobante de Pago',
        description: 'Comprobante de pago de arriendo o servicio',
        available: true,
      }),
    ]);
    console.log(`✓ ${documentTypes.length} document types`);

    // ----- 2 properties (no images) -----
    console.log('Seeding 2 properties (no media)...');
    const year = new Date().getFullYear().toString().slice(-2);

    const salePayload: DeepPartial<Property> = {
      code: `PV-${year}-0001`,
      title: 'Casa demo en venta',
      description: 'Propiedad mínima de ejemplo (venta), sin imágenes.',
      status: PropertyStatus.PUBLISHED,
      operationType: PropertyOperationType.SALE,
      price: 120000000,
      currencyPrice: CurrencyPriceEnum.CLP,
      bedrooms: 3,
      bathrooms: 2,
      builtSquareMeters: 120,
      landSquareMeters: 200,
      parkingSpaces: 1,
      state: RegionEnum.METROPOLITANA,
      city: ComunaEnum.LAS_CONDES,
      creatorUser: adminUser,
      propertyType: typeByName['casa'],
      publicationDate: new Date(),
      isFeatured: false,
    };

    const rentPayload: DeepPartial<Property> = {
      code: `PA-${year}-0001`,
      title: 'Departamento demo en arriendo',
      description: 'Propiedad mínima de ejemplo (arriendo), sin imágenes.',
      status: PropertyStatus.PUBLISHED,
      operationType: PropertyOperationType.RENT,
      price: 550000,
      currencyPrice: CurrencyPriceEnum.CLP,
      bedrooms: 2,
      bathrooms: 1,
      builtSquareMeters: 65,
      parkingSpaces: 1,
      state: RegionEnum.METROPOLITANA,
      city: ComunaEnum.PROVIDENCIA,
      creatorUser: adminUser,
      propertyType: typeByName['apartamento'],
      publicationDate: new Date(),
      isFeatured: false,
    };

    await propertyRepository.save([
      propertyRepository.create(salePayload),
      propertyRepository.create(rentPayload),
    ]);
    console.log('✓ 2 published properties (1 sale, 1 rent)');

    console.log('\n✅ Minimal seed completed');
    console.log(`  • admin: ${adminUser.email} / 890890`);
    console.log(`  • ${propertyTypes.length} property types`);
    console.log(`  • ${documentTypes.length} document types`);
    console.log('  • 2 properties (no images)');
  } catch (error) {
    console.error('Minimal seed failed:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seedMinimal()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch(() => process.exit(1));

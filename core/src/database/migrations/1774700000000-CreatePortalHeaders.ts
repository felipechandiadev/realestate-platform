import { MigrationInterface, QueryRunner } from 'typeorm';

const NAV_ITEMS = JSON.stringify([
  {
    id: 'propiedades',
    label: 'Propiedades',
    enabled: true,
    children: [
      { id: 'ventas', label: 'Ventas', href: '/properties/sale', enabled: true },
      { id: 'arriendos', label: 'Arriendos', href: '/properties/rent', enabled: true },
      { id: 'administraciones', label: 'Administraciones', href: '/services/management', enabled: true },
    ],
  },
  {
    id: 'nosotros',
    label: 'Nosotros',
    enabled: true,
    children: [
      { id: 'quienes-somos', label: 'Quiénes somos', href: '/aboutUs', enabled: true },
      { id: 'nuestro-equipo', label: 'Nuestro Equipo', href: '/ourTeam', enabled: true },
      { id: 'testimonios', label: 'Testimonios', href: '/testimonials', enabled: true },
    ],
  },
  { id: 'vende', label: 'Vende tu Propiedad', href: '/sell-property', enabled: true },
  { id: 'arrienda', label: 'Arrienda tu Propiedad', href: '/rent-property', enabled: true },
  { id: 'valoriza', label: 'Valoriza tu Propiedad', href: '/valuation', enabled: true },
  { id: 'blog', label: 'Blog', href: '/blog', enabled: true },
  { id: 'contacto', label: 'Contacto', action: 'contact', enabled: true },
]);

const ACCOUNT_ITEMS = JSON.stringify([
  { id: 'mis-datos', label: 'Mis Datos', href: '/personalInfo', enabled: true },
  { id: 'notificaciones', label: 'Notificaciones', href: '/notifications', enabled: true },
  { id: 'mis-propiedades', label: 'Mis Propiedades', href: '/myProperties', enabled: true },
  { id: 'favoritos', label: 'Favoritos', href: '/favorites', enabled: true },
  { id: 'mis-contratos', label: 'Mis Contratos', href: '/myContracts', enabled: true },
]);

export class CreatePortalHeaders1774700000000 implements MigrationInterface {
  name = 'CreatePortalHeaders1774700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.query(
      `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'portal_headers'
      `,
    );
    if (table.length === 0) {
      await queryRunner.query(`
        CREATE TABLE \`portal_headers\` (
          \`id\` varchar(36) NOT NULL,
          \`logoUrl\` varchar(500) NULL,
          \`showCompanyName\` tinyint NOT NULL DEFAULT 1,
          \`showMail\` tinyint NOT NULL DEFAULT 1,
          \`showPhone\` tinyint NOT NULL DEFAULT 1,
          \`showUf\` tinyint NOT NULL DEFAULT 1,
          \`ufLabel\` varchar(40) NOT NULL DEFAULT 'UF hoy',
          \`showLogin\` tinyint NOT NULL DEFAULT 1,
          \`showRegister\` tinyint NOT NULL DEFAULT 1,
          \`loginLabel\` varchar(40) NOT NULL DEFAULT 'Ingresar',
          \`registerLabel\` varchar(40) NOT NULL DEFAULT 'Registrarse',
          \`navItems\` json NOT NULL,
          \`accountItems\` json NOT NULL,
          \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    }

    const rows = await queryRunner.query('SELECT `id` FROM `portal_headers` LIMIT 1');
    if (rows.length === 0) {
      await queryRunner.query(
        `
          INSERT INTO \`portal_headers\` (
            \`id\`, \`logoUrl\`, \`showCompanyName\`, \`showMail\`, \`showPhone\`, \`showUf\`,
            \`ufLabel\`, \`showLogin\`, \`showRegister\`, \`loginLabel\`, \`registerLabel\`,
            \`navItems\`, \`accountItems\`
          ) VALUES (UUID(), NULL, 1, 1, 1, 1, 'UF hoy', 1, 1, 'Ingresar', 'Registrarse', ?, ?)
        `,
        [NAV_ITEMS, ACCOUNT_ITEMS],
      );
    }

    const entityType = await queryRunner.query(
      `
        SELECT COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'audit_logs'
          AND COLUMN_NAME = 'entityType'
      `,
    );
    const columnType = entityType[0]?.COLUMN_TYPE as string | undefined;
    if (columnType?.startsWith('enum(') && !columnType.includes("'PORTAL_HEADER'")) {
      const next = columnType.replace(/\)$/, ",'PORTAL_HEADER')");
      await queryRunner.query(`ALTER TABLE \`audit_logs\` MODIFY \`entityType\` ${next} NOT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `portal_headers`');
  }
}

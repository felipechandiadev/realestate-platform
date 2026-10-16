import { MigrationInterface, QueryRunner } from 'typeorm';

const MENU_ITEMS = JSON.stringify([
  { id: 'inicio', label: 'Inicio', href: '/', enabled: true },
  { id: 'arriendos', label: 'Arriendos', href: '/properties/rent', enabled: true },
  { id: 'ventas', label: 'Ventas', href: '/properties/sale', enabled: true },
  { id: 'administraciones', label: 'Administraciones', href: '/services/management', enabled: true },
  { id: 'publica', label: 'Publica tu propiedad', href: '/publish', enabled: true },
  { id: 'equipo', label: 'Nuestro equipo', href: '/ourTeam', enabled: true },
  { id: 'testimonios', label: 'Testimonios', href: '/testimonials', enabled: true },
  { id: 'blog', label: 'Blog', href: '/blog', enabled: true },
  { id: 'privacidad', label: 'Privacidad', href: '/privacidad', enabled: true },
]);

export class CreatePortalFooters1775100000000 implements MigrationInterface {
  name = 'CreatePortalFooters1775100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.query(
      `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'portal_footers'
      `,
    );
    if (table.length === 0) {
      await queryRunner.query(`
        CREATE TABLE \`portal_footers\` (
          \`id\` varchar(36) NOT NULL,
          \`logoUrl\` varchar(500) NULL,
          \`showCompany\` tinyint NOT NULL DEFAULT 1,
          \`showAddress\` tinyint NOT NULL DEFAULT 1,
          \`showPhone\` tinyint NOT NULL DEFAULT 1,
          \`showHours\` tinyint NOT NULL DEFAULT 1,
          \`showMail\` tinyint NOT NULL DEFAULT 1,
          \`showSocial\` tinyint NOT NULL DEFAULT 1,
          \`showPartnerships\` tinyint NOT NULL DEFAULT 1,
          \`showFaqs\` tinyint NOT NULL DEFAULT 1,
          \`showCopyright\` tinyint NOT NULL DEFAULT 1,
          \`menuTitle\` varchar(80) NOT NULL DEFAULT 'Menu',
          \`contactTitle\` varchar(80) NOT NULL DEFAULT 'Contacto',
          \`socialTitle\` varchar(80) NOT NULL DEFAULT 'Síguenos en redes sociales',
          \`partnershipsTitle\` varchar(80) NOT NULL DEFAULT 'Nuestras alianzas',
          \`faqsTitle\` varchar(80) NOT NULL DEFAULT 'FAQs',
          \`copyrightSuffix\` varchar(120) NOT NULL DEFAULT 'Todos los derechos reservados.',
          \`menuItems\` json NOT NULL,
          \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    }

    const rows = await queryRunner.query('SELECT `id` FROM `portal_footers` LIMIT 1');
    if (rows.length === 0) {
      await queryRunner.query(
        `
          INSERT INTO \`portal_footers\` (
            \`id\`, \`logoUrl\`, \`showCompany\`, \`showAddress\`, \`showPhone\`, \`showHours\`,
            \`showMail\`, \`showSocial\`, \`showPartnerships\`, \`showFaqs\`, \`showCopyright\`,
            \`menuTitle\`, \`contactTitle\`, \`socialTitle\`, \`partnershipsTitle\`, \`faqsTitle\`,
            \`copyrightSuffix\`, \`menuItems\`
          ) VALUES (
            UUID(), NULL, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            'Menu', 'Contacto', 'Síguenos en redes sociales', 'Nuestras alianzas', 'FAQs',
            'Todos los derechos reservados.', ?
          )
        `,
        [MENU_ITEMS],
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
    if (columnType?.startsWith('enum(') && !columnType.includes("'PORTAL_FOOTER'")) {
      const next = columnType.replace(/\)$/, ",'PORTAL_FOOTER')");
      await queryRunner.query(`ALTER TABLE \`audit_logs\` MODIFY \`entityType\` ${next} NOT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `portal_footers`');
  }
}

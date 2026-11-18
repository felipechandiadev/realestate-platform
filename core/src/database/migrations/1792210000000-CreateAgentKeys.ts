import { MigrationInterface, QueryRunner } from 'typeorm';

/** Credenciales de agentes de IA (hash de la key, permisos, dueño admin). Idempotente. */
export class CreateAgentKeys1792210000000 implements MigrationInterface {
  name = 'CreateAgentKeys1792210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('agent_keys')) return;
    await queryRunner.query(`
      CREATE TABLE \`agent_keys\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(80) NOT NULL,
        \`ownerId\` varchar(36) NOT NULL,
        \`keyPrefix\` varchar(16) NOT NULL,
        \`keyHash\` char(64) NOT NULL,
        \`scopes\` json NOT NULL,
        \`expiresAt\` datetime NULL,
        \`lastUsedAt\` datetime NULL,
        \`revokedAt\` datetime NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_agent_keys_keyPrefix\` (\`keyPrefix\`),
        INDEX \`IDX_agent_keys_ownerId\` (\`ownerId\`)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `agent_keys`');
  }
}

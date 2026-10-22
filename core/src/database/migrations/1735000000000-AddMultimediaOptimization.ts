import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddMultimediaOptimization1735000000000 implements MigrationInterface {
  name = 'AddMultimediaOptimization1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotente: si la tabla de variantes ya existe (creada por synchronize), no hacer nada.
    if (await queryRunner.hasTable('multimedia_variants')) return;

    // 1. Agregar nuevas columnas a la tabla multimedia (solo las que falten)
    const newColumns = [
      new TableColumn({
        name: 'originalSize',
        type: 'int',
        isNullable: true,
        comment: 'Tamaño original del archivo en bytes antes de compresión',
      }),
      new TableColumn({
        name: 'compressedSize',
        type: 'int',
        isNullable: true,
        comment: 'Tamaño después de compresión en bytes',
      }),
      new TableColumn({
        name: 'compressionRatio',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
        comment: 'Porcentaje de compresión logrado',
      }),
      new TableColumn({
        name: 'width',
        type: 'int',
        isNullable: true,
        comment: 'Ancho de la imagen original en píxeles',
      }),
      new TableColumn({
        name: 'height',
        type: 'int',
        isNullable: true,
        comment: 'Alto de la imagen original en píxeles',
      }),
    ];
    for (const column of newColumns) {
      if (!(await queryRunner.hasColumn('multimedia', column.name))) {
        await queryRunner.addColumn('multimedia', column);
      }
    }

    // 2. Crear tabla multimedia_variants
    await queryRunner.createTable(
      new Table({
        name: 'multimedia_variants',
        columns: [
          {
            // MySQL: uuid = varchar(36), generado por TypeORM (sin default de Postgres)
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'multimediaId',
            type: 'varchar',
            length: '36',
            comment: 'Referencia al multimedia original',
          },
          {
            name: 'variantType',
            type: 'enum',
            enum: [
              'THUMBNAIL_SM',
              'THUMBNAIL_MD',
              'THUMBNAIL_LG',
              'FULL',
              'AVATAR_SM',
              'AVATAR_MD',
              'AVATAR_LG',
              'OG_IMAGE',
              'HERO',
              'SLIDE_MOBILE',
              'SLIDE_TABLET',
              'SLIDE_DESKTOP',
              'SLIDE_THUMB',
            ],
            comment: 'Tipo de variante de la imagen',
          },
          {
            name: 'format',
            type: 'enum',
            enum: ['webp', 'jpeg', 'png'],
            comment: 'Formato de la imagen',
          },
          {
            name: 'width',
            type: 'int',
            comment: 'Ancho de la variante en píxeles',
          },
          {
            name: 'height',
            type: 'int',
            comment: 'Alto de la variante en píxeles',
          },
          {
            name: 'size',
            type: 'int',
            comment: 'Tamaño del archivo en bytes',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '500',
            comment: 'URL pública de la variante en R2',
          },
          {
            name: 'r2Key',
            type: 'varchar',
            length: '500',
            comment: 'Key del archivo en Cloudflare R2',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 3. Crear foreign key hacia multimedia con CASCADE DELETE
    await queryRunner.createForeignKey(
      'multimedia_variants',
      new TableForeignKey({
        columnNames: ['multimediaId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'multimedia',
        onDelete: 'CASCADE',
        name: 'FK_multimedia_variants_multimedia',
      }),
    );

    // 4. Crear índices para búsquedas eficientes
    await queryRunner.createIndex(
      'multimedia_variants',
      new TableIndex({
        name: 'IDX_multimedia_variants_multimediaId',
        columnNames: ['multimediaId'],
      }),
    );

    await queryRunner.createIndex(
      'multimedia_variants',
      new TableIndex({
        name: 'IDX_multimedia_variants_type_format',
        columnNames: ['variantType', 'format'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Eliminar índices
    await queryRunner.dropIndex(
      'multimedia_variants',
      'IDX_multimedia_variants_type_format',
    );
    await queryRunner.dropIndex(
      'multimedia_variants',
      'IDX_multimedia_variants_multimediaId',
    );

    // 2. Eliminar foreign key
    await queryRunner.dropForeignKey(
      'multimedia_variants',
      'FK_multimedia_variants_multimedia',
    );

    // 3. Eliminar tabla multimedia_variants
    await queryRunner.dropTable('multimedia_variants');

    // 4. Eliminar columnas de multimedia
    await queryRunner.dropColumn('multimedia', 'height');
    await queryRunner.dropColumn('multimedia', 'width');
    await queryRunner.dropColumn('multimedia', 'compressionRatio');
    await queryRunner.dropColumn('multimedia', 'compressedSize');
    await queryRunner.dropColumn('multimedia', 'originalSize');
  }
}

import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddTalentProfile1781250500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'talent_profile',
        columns: [
          { name: 'id',               type: 'uuid',      isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'userId',           type: 'uuid',      isUnique: true },
          { name: 'firstName',        type: 'varchar',   length: '100',  isNullable: true },
          { name: 'lastName',         type: 'varchar',   length: '100',  isNullable: true },
          { name: 'phone',            type: 'varchar',   length: '30',   isNullable: true },
          { name: 'location',         type: 'varchar',   length: '200',  isNullable: true },
          { name: 'avatarUrl',        type: 'varchar',   length: '500',  isNullable: true },
          { name: 'bio',              type: 'text',      isNullable: true },
          { name: 'educationSummary', type: 'text',      isNullable: true },
          { name: 'availability',     type: 'int',       isNullable: true },
          { name: 'yearsExperience',  type: 'int',       isNullable: true },
          { name: 'portfolio',        type: 'varchar',   length: '500',  isNullable: true },
          { name: 'isComplete',       type: 'boolean',   default: false },
          { name: 'createdAt',        type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt',        type: 'timestamptz', default: 'now()' },
          { name: 'deletedAt',        type: 'timestamptz', isNullable: true }
        ],
        foreignKeys: [
          { columnNames: ['userId'], referencedTableName: 'user', referencedColumnNames: ['id'], onDelete: 'CASCADE' }
        ]
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: 'profile_skill',
        columns: [
          { name: 'id',        type: 'uuid',        isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'profileId', type: 'uuid' },
          { name: 'name',      type: 'varchar',     length: '100' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
          { name: 'deletedAt', type: 'timestamptz', isNullable: true }
        ],
        foreignKeys: [
          { columnNames: ['profileId'], referencedTableName: 'talent_profile', referencedColumnNames: ['id'], onDelete: 'CASCADE' }
        ],
        uniques: [{ columnNames: ['profileId', 'name'] }]  // enforce de-duplication at DB level
      }),
      true
    );

    // Index for fast lookup by userId
    await queryRunner.createIndex('talent_profile', new TableIndex({ columnNames: ['userId'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('profile_skill', true);
    await queryRunner.dropTable('talent_profile', true);
  }
}

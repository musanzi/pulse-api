import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuests1781250200000 implements MigrationInterface {
  name = 'AddQuests1781250200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."quest_domain_enum" AS ENUM('CODING', 'FINANCE', 'AGRITECH', 'MINING', 'ENERGY', 'LOGISTICS')`
    );
    await queryRunner.query(`CREATE TYPE "public"."quest_level_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED')`);
    await queryRunner.query(`CREATE TYPE "public"."quest_status_enum" AS ENUM('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED')`);
    await queryRunner.query(
      `CREATE TYPE "public"."quest_skill_requiredlevel_enum" AS ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')`
    );
    await queryRunner.query(
      `CREATE TABLE "quest" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(200) NOT NULL, "description" text NOT NULL, "domain" "public"."quest_domain_enum" NOT NULL, "level" "public"."quest_level_enum", "durationDays" integer, "status" "public"."quest_status_enum" NOT NULL DEFAULT 'DRAFT', "organisationId" uuid NOT NULL, "createdById" uuid, CONSTRAINT "PK_quest" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "quest_deliverable" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(200) NOT NULL, "description" text, "required" boolean NOT NULL DEFAULT true, "questId" uuid NOT NULL, CONSTRAINT "PK_quest_deliverable" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "quest_skill" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "questId" uuid NOT NULL, "skillId" uuid NOT NULL, "requiredLevel" "public"."quest_skill_requiredlevel_enum", CONSTRAINT "PK_quest_skill" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "quest_deliverable" ADD CONSTRAINT "FK_quest_deliverable_quest" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "quest_skill" ADD CONSTRAINT "FK_quest_skill_quest" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quest_skill" DROP CONSTRAINT "FK_quest_skill_quest"`);
    await queryRunner.query(`ALTER TABLE "quest_deliverable" DROP CONSTRAINT "FK_quest_deliverable_quest"`);
    await queryRunner.query(`DROP TABLE "quest_skill"`);
    await queryRunner.query(`DROP TABLE "quest_deliverable"`);
    await queryRunner.query(`DROP TABLE "quest"`);
    await queryRunner.query(`DROP TYPE "public"."quest_skill_requiredlevel_enum"`);
    await queryRunner.query(`DROP TYPE "public"."quest_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."quest_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."quest_domain_enum"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplications1781250300000 implements MigrationInterface {
  name = 'AddApplications1781250300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."application_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')`
    );
    await queryRunner.query(
      `CREATE TABLE "application" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "questId" uuid NOT NULL, "teamId" uuid, "status" "public"."application_status_enum" NOT NULL DEFAULT 'PENDING', "motivation" text, "domainDetails" json, "cvDocumentId" uuid, CONSTRAINT "UQ_application_user_quest" UNIQUE ("userId", "questId"), CONSTRAINT "PK_application" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_application_quest" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "application" ADD CONSTRAINT "FK_application_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_application_user"`);
    await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_application_quest"`);
    await queryRunner.query(`DROP TABLE "application"`);
    await queryRunner.query(`DROP TYPE "public"."application_status_enum"`);
  }
}

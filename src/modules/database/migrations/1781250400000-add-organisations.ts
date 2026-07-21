import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganisations1781250400000 implements MigrationInterface {
  name = 'AddOrganisations1781250400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."organisation_member_memberrole_enum" AS ENUM('OWNER', 'RECRUITER')`
    );
    await queryRunner.query(
      `CREATE TABLE "organisation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(150) NOT NULL, "slug" character varying(180) NOT NULL, "description" text, "sector" character varying(100), "websiteUrl" character varying(255), "logoUrl" character varying(255), CONSTRAINT "UQ_organisation_name" UNIQUE ("name"), CONSTRAINT "UQ_organisation_slug" UNIQUE ("slug"), CONSTRAINT "PK_organisation" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "organisation_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "organisationId" uuid NOT NULL, "memberRole" "public"."organisation_member_memberrole_enum" NOT NULL, "joinedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_organisation_member_user_org" UNIQUE ("userId", "organisationId"), CONSTRAINT "PK_organisation_member" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation_member" ADD CONSTRAINT "FK_organisation_member_organisation" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "organisation_member" ADD CONSTRAINT "FK_organisation_member_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "organisation_member" DROP CONSTRAINT "FK_organisation_member_user"`);
    await queryRunner.query(
      `ALTER TABLE "organisation_member" DROP CONSTRAINT "FK_organisation_member_organisation"`
    );
    await queryRunner.query(`DROP TABLE "organisation_member"`);
    await queryRunner.query(`DROP TABLE "organisation"`);
    await queryRunner.query(`DROP TYPE "public"."organisation_member_memberrole_enum"`);
  }
}

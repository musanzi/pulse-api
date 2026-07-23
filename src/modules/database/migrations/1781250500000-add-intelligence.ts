import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntelligence1781250500000 implements MigrationInterface {
  name = 'AddIntelligence1781250500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."recommendation_type_enum" AS ENUM('QUEST', 'LEARNING_PATH', 'TARGET_ROLE')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recommendation_status_enum" AS ENUM('SUGGESTED', 'VIEWED', 'ACCEPTED', 'REJECTED', 'DISMISSED', 'COMPLETED')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."learning_path_step_type_enum" AS ENUM('QUEST', 'SKILL', 'RESOURCE')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recommendation_feedback_feedbacktype_enum" AS ENUM('HELPFUL', 'NOT_HELPFUL', 'IRRELEVANT', 'TOO_HARD', 'TOO_EASY')`
    );
    await queryRunner.query(
      `CREATE TABLE "match" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "questId" uuid NOT NULL, "score" double precision NOT NULL, "explanation" text, "method" character varying(120), "computedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_match_user_quest" UNIQUE ("userId", "questId"), CONSTRAINT "PK_match" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "recommendation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "userId" uuid NOT NULL, "type" "public"."recommendation_type_enum" NOT NULL, "questId" uuid, "targetRoleId" uuid, "score" double precision, "reason" text NOT NULL, "skillGaps" json, "modelVersion" character varying(120) NOT NULL, "status" "public"."recommendation_status_enum" NOT NULL DEFAULT 'SUGGESTED', CONSTRAINT "PK_recommendation" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "learning_path_step" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "recommendationId" uuid NOT NULL, "stepOrder" integer NOT NULL, "type" "public"."learning_path_step_type_enum" NOT NULL, "questId" uuid, "skillId" uuid, "title" character varying(200) NOT NULL, "note" text, "isCompleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_learning_path_step" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "recommendation_feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "recommendationId" uuid NOT NULL, "userId" uuid NOT NULL, "feedbackType" "public"."recommendation_feedback_feedbacktype_enum" NOT NULL, "comment" text, CONSTRAINT "PK_recommendation_feedback" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "FK_match_quest" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "FK_match_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "recommendation" ADD CONSTRAINT "FK_recommendation_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "learning_path_step" ADD CONSTRAINT "FK_learning_path_step_recommendation" FOREIGN KEY ("recommendationId") REFERENCES "recommendation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "recommendation_feedback" ADD CONSTRAINT "FK_recommendation_feedback_recommendation" FOREIGN KEY ("recommendationId") REFERENCES "recommendation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "recommendation_feedback" ADD CONSTRAINT "FK_recommendation_feedback_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recommendation_feedback" DROP CONSTRAINT "FK_recommendation_feedback_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "recommendation_feedback" DROP CONSTRAINT "FK_recommendation_feedback_recommendation"`
    );
    await queryRunner.query(
      `ALTER TABLE "learning_path_step" DROP CONSTRAINT "FK_learning_path_step_recommendation"`
    );
    await queryRunner.query(`ALTER TABLE "recommendation" DROP CONSTRAINT "FK_recommendation_user"`);
    await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_match_user"`);
    await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_match_quest"`);
    await queryRunner.query(`DROP TABLE "recommendation_feedback"`);
    await queryRunner.query(`DROP TABLE "learning_path_step"`);
    await queryRunner.query(`DROP TABLE "recommendation"`);
    await queryRunner.query(`DROP TABLE "match"`);
    await queryRunner.query(`DROP TYPE "public"."recommendation_feedback_feedbacktype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."learning_path_step_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."recommendation_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."recommendation_type_enum"`);
  }
}

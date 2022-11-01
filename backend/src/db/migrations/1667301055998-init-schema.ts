import { MigrationInterface, QueryRunner } from 'typeorm';

export class initSchema1667301055998 implements MigrationInterface {
  name = 'initSchema1667301055998';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."dicoms_status_enum" AS ENUM('not_marked', 'in_markup', 'markup_done')
        `);
    await queryRunner.query(`
            CREATE TABLE "dicoms" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "isUploaded" boolean NOT NULL DEFAULT false,
                "researchId" uuid NOT NULL,
                "markup" json,
                "status" "public"."dicoms_status_enum" NOT NULL DEFAULT 'not_marked',
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_3d7bce9ed82037c262056d331ac" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "dicomsResearchIdIdx" ON "dicoms" ("researchId")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "dicomsResearchIdNameUniqueIdx" ON "dicoms" ("researchId", "name")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "refreshToken" character varying,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
                "isActive" boolean NOT NULL DEFAULT true,
                "description" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."researches_status_enum" AS ENUM(
                'created',
                'ready_to_mark',
                'generating',
                'in_markup',
                'markup_done',
                'error'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "researches" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "status" "public"."researches_status_enum" NOT NULL DEFAULT 'created',
                "parentResearchId" uuid,
                "generatingParams" json,
                "createdByUserId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_dc5bf1f6e68778d8f193f6e9d54" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "researchesNameIdx" ON "researches" ("name")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "researchesParentResearchIdIdx" ON "researches" ("parentResearchId")
        `);
    await queryRunner.query(`
            CREATE INDEX "researchesUserIdIdx" ON "researches" ("createdByUserId")
        `);
    await queryRunner.query(`
            ALTER TABLE "dicoms"
            ADD CONSTRAINT "FK_e9ae3d264c17f98befeb64c2f69" FOREIGN KEY ("researchId") REFERENCES "researches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD CONSTRAINT "FK_ebc08acc6a4fe04c2bf54a89c89" FOREIGN KEY ("parentResearchId") REFERENCES "researches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD CONSTRAINT "FK_b0f74459c3c32e63034d91a235c" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "researches" DROP CONSTRAINT "FK_b0f74459c3c32e63034d91a235c"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches" DROP CONSTRAINT "FK_ebc08acc6a4fe04c2bf54a89c89"
        `);
    await queryRunner.query(`
            ALTER TABLE "dicoms" DROP CONSTRAINT "FK_e9ae3d264c17f98befeb64c2f69"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."researchesUserIdIdx"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."researchesParentResearchIdIdx"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."researchesNameIdx"
        `);
    await queryRunner.query(`
            DROP TABLE "researches"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."researches_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."dicomsResearchIdNameUniqueIdx"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."dicomsResearchIdIdx"
        `);
    await queryRunner.query(`
            DROP TABLE "dicoms"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."dicoms_status_enum"
        `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeResearchesDicoms1667293540923 implements MigrationInterface {
  name = 'changeResearchesDicoms1667293540923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."dicomsResearchIdNameDicomTypeUniqueIdx"
        `);
    await queryRunner.query(`
            DELETE FROM "dicoms" WHERE "dicomType" = 'generated'
        `);
    await queryRunner.query(`
            ALTER TABLE "dicoms" DROP COLUMN "dicomType"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."dicoms_dicomtype_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD "parentResearchId" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD "generatingParams" json
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."researches_status_enum"
            RENAME TO "researches_status_enum_old"
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
            ALTER TABLE "researches"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ALTER COLUMN "status" TYPE "public"."researches_status_enum" USING 'created'::"public"."researches_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ALTER COLUMN "status"
            SET DEFAULT 'created'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."researches_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "dicomsResearchIdNameUniqueIdx" ON "dicoms" ("researchId", "name")
        `);
    await queryRunner.query(`
            CREATE INDEX "researchesParentResearchIdIdx" ON "researches" ("parentResearchId")
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD CONSTRAINT "FK_ebc08acc6a4fe04c2bf54a89c89" FOREIGN KEY ("parentResearchId") REFERENCES "researches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "researches" DROP CONSTRAINT "FK_ebc08acc6a4fe04c2bf54a89c89"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."researchesParentResearchIdIdx"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."dicomsResearchIdNameUniqueIdx"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."researches_status_enum_old" AS ENUM(
                'created',
                'uploading',
                'uploaded',
                'generating',
                'generated',
                'in_markup',
                'markup_done'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ALTER COLUMN "status" DROP DEFAULT
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ALTER COLUMN "status" TYPE "public"."researches_status_enum_old" USING "status"::"text"::"public"."researches_status_enum_old"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ALTER COLUMN "status"
            SET DEFAULT 'created'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."researches_status_enum"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."researches_status_enum_old"
            RENAME TO "researches_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches" DROP COLUMN "generatingParams"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches" DROP COLUMN "parentResearchId"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."dicoms_dicomtype_enum" AS ENUM('original', 'generated')
        `);
    await queryRunner.query(`
            ALTER TABLE "dicoms"
            ADD "dicomType" "public"."dicoms_dicomtype_enum" NOT NULL DEFAULT 'original'
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "dicomsResearchIdNameDicomTypeUniqueIdx" ON "dicoms" ("name", "dicomType", "researchId")
            WHERE ("deletedAt" IS NULL)
        `);
  }
}

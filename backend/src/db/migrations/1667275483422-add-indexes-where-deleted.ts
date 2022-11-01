import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIndexesWhereDeleted1667275483422 implements MigrationInterface {
  name = 'addIndexesWhereDeleted1667275483422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE UNIQUE INDEX "researchesNameIdx" ON "researches" ("name")
            WHERE "deletedAt" IS NULL
        `);
    await queryRunner.query(`
            DROP INDEX "dicomsResearchIdNameDicomTypeUniqueIdx"
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "dicomsResearchIdNameDicomTypeUniqueIdx" ON "dicoms" ("researchId", "name", "dicomType")
            WHERE "deletedAt" IS NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "dicomsResearchIdNameDicomTypeUniqueIdx"
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "dicomsResearchIdNameDicomTypeUniqueIdx" ON "dicoms" ("researchId", "name", "dicomType")
        `);
    await queryRunner.query(`
            DROP INDEX "public"."researchesNameIdx"
        `);
  }
}

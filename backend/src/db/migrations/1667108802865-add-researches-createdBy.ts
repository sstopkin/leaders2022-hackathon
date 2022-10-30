import { MigrationInterface, QueryRunner } from 'typeorm';

export class addResearchesCreatedBy1667108802865 implements MigrationInterface {
  name = 'addResearchesCreatedBy1667108802865';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD "createdByUserId" uuid NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "researchesUserIdIdx" ON "researches" ("createdByUserId")
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
            DROP INDEX "public"."researchesUserIdIdx"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches" DROP COLUMN "createdByUserId"
        `);
  }
}

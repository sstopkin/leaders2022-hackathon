import { MigrationInterface, QueryRunner } from 'typeorm';

export class moveMarkupFromResearchesToDicoms1667465157823
  implements MigrationInterface
{
  name = 'moveMarkupFromResearchesToDicoms1667465157823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "dicoms" DROP COLUMN "markup"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD "markup" json
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "researches" DROP COLUMN "markup"
        `);
    await queryRunner.query(`
            ALTER TABLE "dicoms"
            ADD "markup" json
        `);
  }
}

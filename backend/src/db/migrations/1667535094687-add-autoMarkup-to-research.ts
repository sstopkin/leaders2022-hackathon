import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAutoMarkupToResearch1667535094687
  implements MigrationInterface
{
  name = 'addAutoMarkupToResearch1667535094687';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD "autoMarkup" json
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "researches" DROP COLUMN "autoMarkup"
        `);
  }
}

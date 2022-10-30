import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDicomStatus1667103012549 implements MigrationInterface {
  name = 'addDicomStatus1667103012549';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."dicoms_status_enum" AS ENUM('not_marked', 'in_markup', 'markup_done')
        `);
    await queryRunner.query(`
            ALTER TABLE "dicoms"
            ADD "status" "public"."dicoms_status_enum" NOT NULL DEFAULT 'not_marked'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "dicoms" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."dicoms_status_enum"
        `);
  }
}

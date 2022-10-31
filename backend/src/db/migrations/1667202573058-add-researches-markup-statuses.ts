import { MigrationInterface, QueryRunner } from 'typeorm';

export class addResearchesMarkupStatuses1667202573058
  implements MigrationInterface
{
  name = 'addResearchesMarkupStatuses1667202573058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TYPE "public"."researches_status_enum"
            RENAME TO "researches_status_enum_old"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."researches_status_enum" AS ENUM(
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
            ALTER COLUMN "status" TYPE "public"."researches_status_enum" USING "status"::"text"::"public"."researches_status_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ALTER COLUMN "status"
            SET DEFAULT 'created'
        `);
    await queryRunner.query(`
            DROP TYPE "public"."researches_status_enum_old"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."researches_status_enum_old" AS ENUM(
                'created',
                'uploading',
                'uploaded',
                'generating',
                'generated'
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
  }
}

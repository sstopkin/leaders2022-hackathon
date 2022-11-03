import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserMiddleNameResearchAssigneeUserId1667458249690
  implements MigrationInterface
{
  name = 'addUserMiddleNameResearchAssigneeUserId1667458249690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "middleName" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD "assigneeUserId" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "researchesAssigneeUserIdIdx" ON "researches" ("assigneeUserId")
        `);
    await queryRunner.query(`
            ALTER TABLE "researches"
            ADD CONSTRAINT "FK_5273fd83e9a001b6bd390e816e6" FOREIGN KEY ("assigneeUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "researches" DROP CONSTRAINT "FK_5273fd83e9a001b6bd390e816e6"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."researchesAssigneeUserIdIdx"
        `);
    await queryRunner.query(`
            ALTER TABLE "researches" DROP COLUMN "assigneeUserId"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "middleName"
        `);
  }
}

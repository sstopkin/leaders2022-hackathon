import { MigrationInterface, QueryRunner } from 'typeorm';

export class createResearchesDicoms1666760146804 implements MigrationInterface {
  name = 'createResearchesDicoms1666760146804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."researches_status_enum" AS ENUM('created', 'uploading', 'uploaded', 'generated')
        `);
    await queryRunner.query(`
            CREATE TABLE "researches" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "status" "public"."researches_status_enum" NOT NULL DEFAULT 'created',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_dc5bf1f6e68778d8f193f6e9d54" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."dicoms_dicomtype_enum" AS ENUM('original', 'generated')
        `);
    await queryRunner.query(`
            CREATE TABLE "dicoms" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "dicomType" "public"."dicoms_dicomtype_enum" NOT NULL DEFAULT 'original',
                "isUploaded" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "researchId" uuid,
                CONSTRAINT "PK_3d7bce9ed82037c262056d331ac" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "dicoms"
            ADD CONSTRAINT "FK_e9ae3d264c17f98befeb64c2f69" FOREIGN KEY ("researchId") REFERENCES "researches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "dicoms" DROP CONSTRAINT "FK_e9ae3d264c17f98befeb64c2f69"
        `);
    await queryRunner.query(`
            DROP TABLE "dicoms"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."dicoms_dicomtype_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "researches"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."researches_status_enum"
        `);
  }
}

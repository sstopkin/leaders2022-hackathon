import { MigrationInterface, QueryRunner } from 'typeorm';

export class initSchema1666782366176 implements MigrationInterface {
  name = 'initSchema1666782366176';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deletedAt" TIMESTAMP,
                "researchId" uuid,
                CONSTRAINT "PK_3d7bce9ed82037c262056d331ac" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."researches_status_enum" AS ENUM('created', 'uploading', 'uploaded', 'generated')
        `);
    await queryRunner.query(`
            CREATE TABLE "researches" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "status" "public"."researches_status_enum" NOT NULL DEFAULT 'created',
                "createdAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_dc5bf1f6e68778d8f193f6e9d54" PRIMARY KEY ("id")
            )
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
            ALTER TABLE "dicoms"
            ADD CONSTRAINT "FK_e9ae3d264c17f98befeb64c2f69" FOREIGN KEY ("researchId") REFERENCES "researches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "dicoms" DROP CONSTRAINT "FK_e9ae3d264c17f98befeb64c2f69"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "researches"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."researches_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "dicoms"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."dicoms_dicomtype_enum"
        `);
  }
}

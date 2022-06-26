import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationsBetweenCommentsUsersAndArticles1656204923470
  implements MigrationInterface
{
  name = 'AddRelationsBetweenCommentsUsersAndArticles1656204923470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "comments" ADD "authorId" integer`);
    await queryRunner.query(`ALTER TABLE "comments" ADD "articleId" integer`);
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_b0011304ebfcb97f597eae6c31f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`,
    );
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "articleId"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "authorId"`);
  }
}

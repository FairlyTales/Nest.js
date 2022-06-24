import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1654966887915 implements MigrationInterface {
  name = 'SeedDb1654966887915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name)
       VALUES ('tag1'),
              ('tag2'),
              ('tag3')`,
    );

    // password is 123
    await queryRunner.query(
      `INSERT INTO users (username, email, password, bio)
       VALUES ('foo', 'tag@mail.com',
               '$2b$10$lsKLAcy86qYPmmgJHSB2y.IEnLCJkQuTBEox54NO1BhvS/cnMMlgK', 'biobiobio')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
       VALUES ('article-1', 'Article 1', 'Article 1 description', 'Article 1 body', 'tag1,tag2', 1)`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
       VALUES ('article-2', 'Article 2', 'Article 2 description', 'Article 2 body', 'tag2,tag3', 1)`,
    );
  }

  //eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';
import { PersistArticleDto } from '@app/article/dto/persistArticleDto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async createArticle(
    user: UserEntity,
    createArticleDto: PersistArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = ArticleService.getSlug(createArticleDto.title);

    // ArticleEntity doesn't have an author property, it's a relation with UserEntity in typeorm
    article.author = user;

    return await this.articleRepository.save(article);
  }

  async getArticle(slug: string): Promise<ArticleEntity> {
    return await this.findBySlug(slug);
  }

  async updateArticle(
    userId: number,
    slug: string,
    updateArticleDto: PersistArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException(
        "Can't update article because it wasn't created by you",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const updateResult = await this.articleRepository
      .createQueryBuilder()
      .update({
        ...article,
        ...updateArticleDto,
      })
      .where('slug = :slug', { slug: article.slug })
      .returning('*')
      .execute();

    console.log(updateResult.raw[0]);

    return updateResult.raw[0];
  }

  async deleteArticle(userId: number, slug: string): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException(
        "Can't delete article because it wasn't created by you",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const deleteResult = await this.articleRepository
      .createQueryBuilder()
      .delete()
      .from(ArticleEntity)
      .where('slug = :slug', { slug: article.slug })
      .returning('*')
      .execute();

    return deleteResult.raw[0];
  }

  buildArticleResponse(
    article: ArticleEntity,
    message?: string,
  ): ArticleResponseInterface {
    return { message, article };
  }

  private async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ slug });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  private static getSlug(title: string): string {
    return slugify(title, { lower: true }) + '-' + uuidv4();
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';
import { ArticleEntity } from '@app/article/article.entity';
import { PersistArticleDto } from '@app/article/dto/persistArticleDto';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { ArticlesQueryInterface } from '@app/article/types/articlesQuery.interface';
import { FollowEntity } from '@app/profile/follow.entity';
import { CommentResponseInterface } from '@app/article/types/commentResponse.interface';
import { CommentDto } from '@app/article/dto/commentDto';
import { CommentEntity } from '@app/article/comment.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async getArticle(slug: string): Promise<ArticleEntity> {
    return await this.findBySlug(slug);
  }

  async getAllArticles(
    userId: number,
    query: ArticlesQueryInterface,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });

      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.favouritedBy) {
      const author = await this.userRepository.findOne(
        {
          username: query.favouritedBy,
        },
        { relations: ['favourites'] },
      );
      console.log(author.favourites);
      const ids = author.favourites.map((article) => article.id);

      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', {
          ids: ids,
        });
      } else {
        // using 1=0 to make the query return empty array
        queryBuilder.andWhere('1=0');
      }
    }

    if (query.limit) queryBuilder.limit(query.limit);

    if (query.offset) queryBuilder.offset(query.offset);

    let favouritedByUserArticlesId: number[] = [];

    // if user is logged in
    if (userId) {
      const user = await this.userRepository.findOne(
        { id: userId },
        { relations: ['favourites'] },
      );

      favouritedByUserArticlesId = user.favourites.map((article) => article.id);
    }

    const allArticles = await queryBuilder.getMany();
    const articleWithFavourites = allArticles.map((article) => {
      const favourited = favouritedByUserArticlesId.includes(article.id);
      return { ...article, favourited };
    });

    return {
      articlesCount,
      articles: articleWithFavourites,
    };
  }

  // get all articles created by users followed by current user
  async getFeed(
    userId: number,
    query: ArticlesQueryInterface,
  ): Promise<ArticlesResponseInterface> {
    const followedUsers = await this.followRepository.find({
      followerId: userId,
    });

    if (followedUsers.length === 0) return { articles: [], articlesCount: 0 };

    const followedUserIds = followedUsers.map((user) => user.followingId);

    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followedUserIds });

    queryBuilder.orderBy('articles.createdAt', 'DESC');
    const articlesCount = await queryBuilder.getCount();

    if (query.limit) queryBuilder.limit(query.limit);
    if (query.offset) queryBuilder.offset(query.offset);

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

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

  async addComment(
    userId: number,
    commentDto: CommentDto,
  ): Promise<CommentEntity> {
    const comment = new CommentEntity();
    Object.assign(comment, commentDto);

    const author = await this.userRepository.findOne(userId);
    comment.author = author;

    return await this.commentRepository.save(comment);
  }

  async deleteComment(
    userId: number,
    slug: string,
    id: string,
  ): Promise<CommentEntity> {
    const article = await this.getArticle(slug);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const commentId = Number(id);
    const comment = await this.commentRepository.findOne({
      id: commentId,
    });

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (comment.author.id !== userId) {
      throw new HttpException(
        'Only author can delete comment',
        HttpStatus.FORBIDDEN,
      );
    }

    const deleteResult = await this.commentRepository
      .createQueryBuilder()
      .delete()
      .from(CommentEntity)
      .where('id = :slug', { slug: commentId })
      .returning('*')
      .execute();

    delete deleteResult.raw[0].articleId;

    return deleteResult.raw[0] as CommentEntity;
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
        HttpStatus.FORBIDDEN,
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

    return updateResult.raw[0];
  }

  async deleteArticle(userId: number, slug: string): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException(
        "Can't delete article because it wasn't created by you",
        HttpStatus.FORBIDDEN,
      );
    }

    const deleteResult = await this.articleRepository
      .createQueryBuilder()
      .delete()
      .from(ArticleEntity)
      .where('slug = :slug', { slug: article.slug })
      .returning('*')
      .execute();

    return deleteResult.raw[0] as ArticleEntity;
  }

  async addArticleToFavorites(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOne(userId, {
      relations: ['favourites'],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isAlreadyFavourited =
      user.favourites.findIndex((fav) => fav.slug === article.slug) !== -1;

    if (isAlreadyFavourited) {
      throw new HttpException(
        'This article is already favourited',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.favourites.push(article);
    article.favouritesCount++;

    await this.userRepository.save(user);
    await this.articleRepository.save(article);

    return article;
  }

  async deleteArticleFromFavourite(
    userId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const user = await this.userRepository.findOne(userId, {
      relations: ['favourites'],
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // 1 if not found, otherwise returns the index of the element
    const articleIndex = user.favourites.findIndex(
      (fav) => fav.slug === article.slug,
    );

    if (articleIndex === -1) {
      throw new HttpException(
        'This article was not favourited',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.favourites.splice(articleIndex, 1);
    article.favouritesCount--;

    await this.userRepository.save(user);
    await this.articleRepository.save(article);

    return article;
  }

  buildArticleResponse(
    article: ArticleEntity,
    message?: string,
  ): ArticleResponseInterface {
    return { message, article };
  }

  buildCommentResponse(comment: CommentEntity): CommentResponseInterface {
    return { message: 'Comment deleted successfully', comment };
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

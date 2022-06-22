import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { PersistArticleDto } from '@app/article/dto/persistArticleDto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { ArticlesQueryInterface } from '@app/article/types/articlesQuery.interface';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async getAllArticles(
    @User('id') userId: number,
    @Query() query: ArticlesQueryInterface,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.getAllArticles(userId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: PersistArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
    );

    return this.articleService.buildArticleResponse(article);
  }

  @Get(':slug')
  async getArticle(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticle(slug);

    return this.articleService.buildArticleResponse(article);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: PersistArticleDto,
  ): Promise<ArticleResponseInterface> {
    const updatedArticle = await this.articleService.updateArticle(
      userId,
      slug,
      updateArticleDto,
    );

    return this.articleService.buildArticleResponse(updatedArticle);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const deletedArticle = await this.articleService.deleteArticle(
      userId,
      slug,
    );

    return this.articleService.buildArticleResponse(
      deletedArticle,
      'Article successfully deleted',
    );
  }

  @Post(':slug/favourites')
  @UseGuards(AuthGuard)
  async favouriteArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(
      userId,
      slug,
    );

    return this.articleService.buildArticleResponse(
      article,
      'Article successfully favourited',
    );
  }
}

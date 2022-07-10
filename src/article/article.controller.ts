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
} from '@nestjs/common';
import { ArticleService } from '@app/article/article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { PersistArticleDto } from '@app/article/dto/persistArticle.dto';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import { ArticlesResponseInterface } from '@app/article/types/articlesResponse.interface';
import { ArticlesQueryInterface } from '@app/article/types/articlesQuery.interface';
import { CommentDto } from '@app/article/dto/comment.dto';
import { CommentResponseInterface } from '@app/article/types/commentResponse.interface';
import { CommentsResponseInterface } from '@app/article/types/commentsResponse.interface';
import { BackendValidationPipe } from '@app/pipes/BackendValidation.pipe';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('articles')
@ApiTags('Articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @ApiOperation({ description: 'Get the specified article' })
  async getAllArticles(
    @User('id') userId: number,
    @Query() query: ArticlesQueryInterface,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.getAllArticles(userId, query);
  }

  // get all articles created by users followed by current user
  @Get('feed')
  @UseGuards(AuthGuard)
  @ApiOperation({ description: 'Get the user feed' })
  async getFeed(
    @User('id') userId: number,
    @Query() query: ArticlesQueryInterface,
  ): Promise<ArticlesResponseInterface> {
    return await this.articleService.getFeed(userId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: PersistArticleDto })
  @ApiOperation({ description: 'Create an article' })
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
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: PersistArticleDto })
  @ApiOperation({ description: 'Update the article' })
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
  @ApiOperation({ description: 'Delete the article' })
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
  @ApiOperation({ description: 'Add article to favourites' })
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

  @Delete(':slug/favourites')
  @UseGuards(AuthGuard)
  @ApiOperation({ description: 'Remove article from favourites' })
  async deleteArticleFromFavourite(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavourite(
      userId,
      slug,
    );

    return this.articleService.buildArticleResponse(
      article,
      'Article successfully unfavourited',
    );
  }

  @Post(':slug/comments')
  @UseGuards(AuthGuard)
  @ApiBody({ type: CommentDto })
  @ApiOperation({ description: 'Add comment to the article' })
  async addComment(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('comment') commentDto: CommentDto,
  ): Promise<CommentResponseInterface> {
    const comment = await this.articleService.addComment(
      userId,
      slug,
      commentDto,
    );

    return this.articleService.buildCommentResponse(comment);
  }

  @Get(':slug/comments')
  @ApiOperation({ description: 'Get all article comments' })
  async getArticleComments(
    @Param('slug') slug: string,
  ): Promise<CommentsResponseInterface> {
    return await this.articleService.getArticleComments(slug);
  }

  @Delete(':slug/comments/:commentId')
  @UseGuards(AuthGuard)
  @ApiOperation({ description: 'Delete article comment' })
  async deleteComment(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Param('commentId') commentId: string,
  ): Promise<CommentResponseInterface> {
    const comment = await this.articleService.deleteComment(
      userId,
      slug,
      commentId,
    );

    return this.articleService.buildCommentResponse(comment);
  }
}

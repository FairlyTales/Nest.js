import { Module } from '@nestjs/common';
import { ArticleController } from '@app/article/article.controller';

@Module({
  controllers: [ArticleController],
})
export class ArticleModule {}

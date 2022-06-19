import { Controller, Post } from '@nestjs/common';

@Controller('articles')
export class ArticleController {
  @Post()
  async createArticle() {
    return 'Hello World!';
  }
}

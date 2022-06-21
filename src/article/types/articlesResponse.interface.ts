import { ArticleEntity } from '@app/article/article.entity';

export interface ArticlesResponseInterface {
  articlesCount: number;
  articles: ArticleEntity[];
}

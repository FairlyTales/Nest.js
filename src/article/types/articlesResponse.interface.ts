import { ArticleType } from '@app/article/types/article.type';

export interface ArticlesResponseInterface {
  articlesCount: number;
  articles: ArticleType[];
}

import { ArticleEntity } from '@app/article/article.entity';

export interface ArticleResponseInterface {
  message?: string;
  article: ArticleEntity;
}

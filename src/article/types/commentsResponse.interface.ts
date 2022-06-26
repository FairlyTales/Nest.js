import { CommentEntity } from '@app/article/comment.entity';

export interface CommentsResponseInterface {
  comments: CommentEntity[];
  commentsCount: number;
}

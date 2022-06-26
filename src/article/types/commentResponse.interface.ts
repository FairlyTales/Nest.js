import { CommentEntity } from '@app/article/comment.entity';

export interface CommentResponseInterface {
  comment: CommentEntity;
  message?: string;
}

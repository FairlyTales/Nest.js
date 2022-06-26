import { IsNotEmpty } from 'class-validator';

export class CommentDto {
  @IsNotEmpty()
  readonly body: string;
}

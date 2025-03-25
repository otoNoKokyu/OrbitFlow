import { Injectable} from '@nestjs/common';
import { BaseRepository } from 'src/common/repository.base';

import { Comment } from './model/comment.model';
@Injectable()
export class CommentRepository extends BaseRepository<Comment> {
  constructor() {
    super(Comment)
  }

}

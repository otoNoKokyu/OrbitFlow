import { Injectable} from '@nestjs/common';
import { BaseRepository } from 'src/common/repository.base';
import { CommentMention } from './model/comment_mentions.model';
import { Transaction } from 'sequelize';
@Injectable()
export class CommentMentionRepository extends BaseRepository<CommentMention> {
  constructor() {
    super(CommentMention)
  }
  async bulkCreate(records: Partial<CommentMention>[], transaction?: Transaction): Promise<CommentMention[]> {
    return this.model.bulkCreate(records, { transaction });
  }
}

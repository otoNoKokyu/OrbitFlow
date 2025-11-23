import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/service.base';

import { Comment } from './model/comment.model';
import { CommentRepository } from './comment.repository';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { Optional, InferCreationAttributes, InferAttributes, ModelAttributes } from 'sequelize';
import { NullishPropertiesOf } from 'sequelize/types/utils';
import { AtLeastOneAttribute, ModelCreationAttributes } from 'src/common/interface/IBase';
import { CommentMentionRepository } from './comment_mentions.repository';
import { NotificationService } from '../notification/notification.service';
import { UserRepository } from '../user/user.repository';
import { IssueRepository } from '../issues/issue.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from '../shared/shared.types';
@Injectable()
export class CommentService extends BaseService<Comment> {
  constructor(
    private commentRepository: CommentRepository,
    private commentMentionRepository: CommentMentionRepository,
    @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
    private readonly issueRepo: IssueRepository,
    private readonly userRepository: UserRepository,
    private readonly eventEmmiter: EventEmitter2
  ) {
    super(commentRepository)
  }

  async createOrUpdateComment(
    body: ModelCreationAttributes<Comment> | (AtLeastOneAttribute<Comment> & { mentions?: string[] }),
    filter: AtLeastOneAttribute<Comment>,
    action: 'create' | 'update'
  ) {
    try {
      const { mentions = [] } = body as { mentions?: string[] };
      delete body.mentions;

      const comment = await this.commentRepository.sequelize.transaction(async (t) => {
        let commentManipulatorFn;

        if (action === 'update') {
          commentManipulatorFn = async() => await this.commentRepository.update({ id: filter.id }, body, t);
        } else {
          commentManipulatorFn = async() => await this.commentRepository.create(body, t);
        }

        const comment = await commentManipulatorFn();

        if (mentions.length) {
          if (mentions.includes(body.author_id)) {
            throw this.serviceException.throw('RESOURCE_CONFLICT', 'Author cannot mention himself in a comment');
          }
          const bulkMentions = mentions.map((e) => ({ comment_id: comment.id ?? filter.id, mentioned_user_id: e }));
          await this.commentMentionRepository.bulkCreate(bulkMentions, t, action === 'update' ? ['comment_id', 'mentioned_user_id'] : undefined);
          this.eventEmmiter.emitAsync(
            NotificationType.ISSUE_COMMENT_CHANGE,
            {
              issueId: filter?.issue_id ?? body?.issue_id,
              emails:mentions,
              comment: body.content
            }
          )
        }
        return comment;
      });

      
      return comment || 'update successful'
    } catch (err) {
      console.error(err);
    }
  }
  // const {projectId,roleId,userId,isActive} = body
  // const doesExist =  await this.userProjectRepository.findOne({
  //     isActive,
  //     projectId,
  //     roleId,
  //     userId
  // });
  // if(doesExist) throw this.serviceException.throw('RESOURCE_CONFLICT','user already exist in project')
  // return this.userProjectRepository.create(body)
}



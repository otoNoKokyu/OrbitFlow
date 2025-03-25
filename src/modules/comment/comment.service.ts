import { Inject, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/service.base';

import { Comment } from './model/comment.model';
import { CommentRepository } from './comment.repository';
import { ServiceException } from 'src/helper/CustomError';
import { ERR_TYPE } from 'src/interface/CustomError';
import { Optional, InferCreationAttributes, InferAttributes, ModelAttributes } from 'sequelize';
import { NullishPropertiesOf } from 'sequelize/types/utils';
import { ModelCreationAttributes } from 'src/common/interface/IBase';
import { CommentMentionRepository } from './comment_mentions.repository';
@Injectable()
export class CommentService extends BaseService<Comment> {
    constructor(
        private commentRepository: CommentRepository,
        private commentMentionRepository: CommentMentionRepository,
        @Inject('ServiceException') private serviceException: ServiceException<ERR_TYPE>,
    ) {
        super(commentRepository)
    }
    async create(
        body: ModelCreationAttributes<Comment> & { mentions?: string[] }
    ) {
        const { mentions } = body;
        delete body.mentions;
        return  this.commentRepository.sequelize.transaction(async (t) => {
            const comment = await this.commentRepository.create(body, t);
            if (mentions?.length) {
                if(mentions.includes(body.author_id)) throw this.serviceException.throw('RESOURCE_CONFLICT','author cannot mention him in comment')
                const bulkMentions = mentions.map((e) => ({ comment_id: comment.id, mentioned_user_id: e }))
                await this.commentMentionRepository.bulkCreate(bulkMentions, t);
            };
            return comment;
        });
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



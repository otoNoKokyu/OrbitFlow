import { Injectable } from '@nestjs/common';
import { Issue } from './model/issue.model';
import { BaseRepository } from 'src/common/repository.base';
import { Comment } from '../comment/model/comment.model';
import { AtLeastOneAttribute, EntityAttributes, ModelAttributes } from 'src/common/interface/IBase';
import { User } from '../user/model/User.model';
import { CommentMention } from '../comment/model/comment_mentions.model';

@Injectable()
export class IssueRepository extends BaseRepository<Issue> {
  constructor() {
    super(Issue)
  }
  async findAndCountAll(filter: Partial<Issue>, page:number , limit:number ) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({
      where: { ...filter },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return {
      data: rows,
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }
  async findOne(
    query: AtLeastOneAttribute<Issue>,
    populatedFileds? : Array< 'assignee' | 'reporter'>,
    attributes?: Array<keyof Partial<EntityAttributes<Issue>>>,
  ):Promise<ModelAttributes<Issue>> {
    const queryFilter: any = {
      where: query,
      include: [
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: CommentMention,
              as: 'mentions', 
              include: [
                {
                  model: User,
                  as: 'mentionedUser',
                  attributes: ['username', 'email', 'phone_number'],
                },
              ],
            },
          ],
        },
      ],
    };
  
    if (populatedFileds?.includes('assignee')) {
      queryFilter.include.push({ model: User, as: 'assignee' });
    }
    
    if (populatedFileds?.includes('reporter')) {
      queryFilter.include.push({ model: User, as: 'reporter' });
    }
  
    if(attributes?.length) queryFilter['attributes'] = attributes
    const issue =  await this.model.findOne(queryFilter)
    return issue?.toJSON();
  }
  async findIssueForNotification(id: string) {
    return await this.findOne(
        { id },
        ['assignee', 'reporter'],
        ['projectIssueId', 'name', 'status', 'updatedAt'])
}
}

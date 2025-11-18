import { Injectable } from '@nestjs/common';
import { Issue } from './model/issue.model';
import { BaseRepository } from 'src/common/repository.base';
import { Comment } from '../comment/model/comment.model';
import { AtLeastOneAttribute, EntityAttributes, ModelAttributes } from 'src/common/interface/IBase';
import { User } from '../user/model/User.model';
import { CommentMention } from '../comment/model/comment_mentions.model';
import { Projects } from '../project/entities/project.model';

@Injectable()
export class IssueRepository extends BaseRepository<Issue> {
  constructor() {
    super(Issue)
  }
async findAndCountAll(filter: Partial<Issue>, page: number, limit: number) {
  const offset = (page - 1) * limit;

  // 1. DB: Only paginate (no WHERE)
  const { rows, count } = await this.model.findAndCountAll({
    attributes: [
      'createdAt',
      'dueDate',
      'name',
      'type',
      'priority',
      'status',
      'projectIssueId',
    ],
    include: [
      {
        model: User,
        as: 'assignee',
        attributes: ['username'],
      },
    ],
    limit,
    offset,
    order: [['createdAt', 'ASC']],
  });

  const filtered = rows.filter((row) =>
    Object.entries(filter).every(([key, val]) => {
      return val === undefined || row[key] === val;
    })
  );

  // 3. Return filtered page + original total (unfiltered)
  return {
    data: filtered,
    totalRecords: count,                    // total in DB (unfiltered)
    totalPages: Math.ceil(count / limit),   // based on full count
    currentPage: page,
  };
}
  async findOne(
    query: AtLeastOneAttribute<Issue>,
    populatedFileds? : Array< 'assignee' | 'reporter' | 'project'>,
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

    if(populatedFileds.includes('reporter')) queryFilter.include.push({ model: Projects, as: 'project', attributes:['id','name'] })
  
    if (populatedFileds?.includes('assignee')) {
      const popObj = { model: User, as: 'assignee' }
       popObj['attributes'] = ['username','first_name','last_name','profile_picture_url','user_id',"email"]
      queryFilter.include.push(popObj);
    }
    
    if (populatedFileds?.includes('reporter')) {
      const popObj = { model: User, as: 'reporter' }
       popObj['attributes'] = ['username','first_name','last_name','profile_picture_url','user_id',"email"]
      queryFilter.include.push(popObj);
    }
  
    if(attributes?.length) queryFilter['attributes'] = attributes

    const issue =  await this.model.findOne(queryFilter)
    return issue?.toJSON();
  }
  async findIssueForNotification(id: string) {
    return await this.findOne(
        { id },
        ['assignee', 'reporter'],
        ['projectIssueId', 'name', 'status', 'updatedAt',"projectId"])
}
}

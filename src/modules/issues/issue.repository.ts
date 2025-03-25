import { Injectable } from '@nestjs/common';
import { Issue } from './model/issue.model';
import { BaseRepository } from 'src/common/repository.base';
import { Comment } from '../comment/model/comment.model';
import { AtLeastOneAttribute, EntityAttributes, ModelAttributes } from 'src/common/interface/IBase';

@Injectable()
export class IssueRepository extends BaseRepository<Issue> {
  constructor() {
    super(Issue)
  }
  async findAndCountAll(filter: Partial<Issue>, page , limit ) {
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
  async findOne(query: AtLeastOneAttribute<Issue>,attributes?: Array<keyof Partial<EntityAttributes<Issue>>>):Promise<ModelAttributes<Issue>> {
    const queryFilter = 
      {
        where: query,
        include: [Comment],
      }
    
    if(attributes?.length) query['attributes'] = attributes
    return await this.model.findOne(queryFilter);
  }
}

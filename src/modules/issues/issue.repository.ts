import { Injectable } from '@nestjs/common';
import { Issue } from './model/issue.model';
import { BaseRepository } from 'src/common/repository.base';
import { Comment } from '../comment/model/comment.model';
import { AtLeastOneAttribute, EntityAttributes, ModelAttributes } from 'src/common/interface/IBase';
import { User } from '../user/model/User.model';
import { CommentMention } from '../comment/model/comment_mentions.model';
import { Projects } from '../project/entities/project.model';
import { Op, Sequelize } from 'sequelize';

@Injectable()
export class IssueRepository extends BaseRepository<Issue> {
  constructor() {
    super(Issue)
  }
  async findAndCountAll(
    filter: Partial<Issue> & { anyKey?: string },
    page: number,
    limit: number
  ) {
    const offset = (page - 1) * limit;

    const where: any = {};

    Object.entries(filter).forEach(([key, val]) => {
      if (key !== "anyKey" && val !== undefined) {
        where[key] = val;
      }
    });

    if (filter.anyKey && String(filter.anyKey).trim() !== "") {
      const q = String(filter.anyKey).toLowerCase();
      where[Op.or] = [
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Issue.name")),
          { [Op.like]: `%${q}%` }
        ),
        Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Issue.projectIssueId")),
          { [Op.like]: `%${q}%` }
        ),
      ];
    }

    const { rows, count } = await this.model.findAndCountAll({
      where,
      attributes: [
        "createdAt",
        "dueDate",
        "name",
        "type",
        "priority",
        "status",
        "projectIssueId",
      ],
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["first_name", "last_name"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "ASC"]],
    });


    // 3. Return filtered page + original total (unfiltered)
    return {
      data: rows,
      totalRecords: count,                    // total in DB (unfiltered)
      totalPages: Math.ceil(count / limit),   // based on full count
      currentPage: page,
    };
  }
  async findOne(
    query: AtLeastOneAttribute<Issue>,
    populatedFileds?: Array<'assignee' | 'reporter' | 'project' | 'subtask'>,
    attributes?: Array<keyof Partial<EntityAttributes<Issue>>>,
  ): Promise<ModelAttributes<Issue>> {
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
            {
              model: User,
              as: 'author',
              attributes: ['first_name', 'last_name', 'profile_picture_url'],
            },
          ],
        },
      ],
    };
    if (populatedFileds?.includes('subtask')) {
      queryFilter.include.push({
        model: Issue,
        as: 'subtasks',
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['first_name', 'profile_picture_url',],
          }],
        attributes: ['id', 'assigneeId', 'name', 'projectIssueId'],
      });
    }

    if (populatedFileds?.includes('reporter')) queryFilter.include.push({ model: Projects, as: 'project', attributes: ['id', 'name'] })

    if (populatedFileds?.includes('assignee')) {
      const popObj = { model: User, as: 'assignee' }
      popObj['attributes'] = ['username', 'first_name', 'last_name', 'profile_picture_url', 'user_id', "email"]
      queryFilter.include.push(popObj);
    }

    if (populatedFileds?.includes('reporter')) {
      const popObj = { model: User, as: 'reporter' }
      popObj['attributes'] = ['username', 'first_name', 'last_name', 'profile_picture_url', 'user_id', "email"]
      queryFilter.include.push(popObj);
    }

    if (attributes?.length) queryFilter['attributes'] = attributes

    const issue = await this.model.findOne(queryFilter)
    return issue?.toJSON();
  }
  async findIssueForNotification(id: string) {
    return await this.findOne(
      { id },
      ['assignee', 'reporter'],
      ['projectIssueId', 'name', 'status', 'updatedAt', "projectId"])
  }
async upsertAttachments(id: string, body: Pick<Issue, "attachments">) {
  return await this.model.sequelize!.transaction(async (t) => {
    const issue = await this.model.findOne({
      where: { id },
      transaction: t
    });

    if (!issue) {
      return [0] as [number];
    }

    const incoming = Array.isArray(body.attachments) ? body.attachments : [];
    const existing = Array.isArray(issue.attachments) ? issue.attachments : [];

    issue.attachments =
      existing.length > 0 ? [...existing, ...incoming] : incoming;

    await issue.save({ transaction: t });

    return [1] as [number];
  });
}

}

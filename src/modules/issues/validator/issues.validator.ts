import * as Joi from 'joi';

export const CreateIssueDto = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().allow(null, ''),
  estimate: Joi.number().integer().min(0).allow(null),
  remaining: Joi.number().integer().min(0).allow(null),
  loggedTime: Joi.number().integer().min(0).allow(null),
  attachments: Joi.array().items(Joi.string()).allow(null),
  assigneeId: Joi.string().uuid().allow(null),
  reporterId: Joi.string().uuid().required(),
  status: Joi.string().max(50).required(),
  priority: Joi.string().max(50).required(),
  projectId: Joi.string().uuid().required(),
  sprintId: Joi.string().allow(null, ''),
  dueDate: Joi.date().iso().allow(null),
  type: Joi.string().valid('task', 'subtask', 'epic', 'story').required(),
  parentId: Joi.string().uuid().allow(null),
});

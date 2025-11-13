import * as Joi from 'joi';

export const CreateIssueSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().allow(null, ''),
  estimate: Joi.number().integer().min(0).allow(null),
  remaining: Joi.number().integer().min(0).allow(null),
  loggedTime: Joi.number().integer().min(0).allow(null),
  attachments: Joi.array().items(Joi.string()).allow(null),
  assigneeId: Joi.string().uuid().allow(null),
  reporterId: Joi.string().uuid().required(),
  priority: Joi.string().max(50).required(),
  projectId: Joi.string().uuid().required(),
  sprintId: Joi.string().allow(null, ''),
  dueDate: Joi.date().iso().allow(null),
  type: Joi.string().valid('task', 'subtask', 'epic', 'story').required(),
  parentId: Joi.string().uuid().allow(null),
}).unknown(false)

export const fetchAllIssueSchema = CreateIssueSchema.fork(
  Object.keys(CreateIssueSchema.describe().keys),
  (schema) => schema.optional()
).append({
  status: Joi.string().optional().allow(null, ''),
  id: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  assignee: Joi.string().optional()
});


export const updateIssueSchema = Joi.object({
  name: Joi.string().min(3).max(255).optional().allow(null, ''),
  description: Joi.string().optional().allow(null, ''),
  estimate: Joi.number().integer().min(0).optional().allow(null, ''),
  loggedTime: Joi.number().integer().min(0).optional().allow(null, ''),
  reporterId: Joi.string().uuid().optional().allow(null, ''),
  assigneeId: Joi.string().uuid().optional().allow(null, ''),
  status: Joi.string().optional().allow(null, ''),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').optional().allow(null, ''),
});

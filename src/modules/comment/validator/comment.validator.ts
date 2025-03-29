import * as Joi from 'joi';

export const CommentSchema = Joi.object({
  issue_id: Joi.string().uuid().required(),
  parent_comment_id: Joi.string().uuid().allow(null,''),
  content: Joi.string().trim().min(1).max(5000).required().messages({
    'string.base': 'Content must be a valid text.',
    'string.empty': 'Content cannot be empty.',
    'string.min': 'Content must be at least 1 character long.',
    'string.max': 'Content cannot exceed 5000 characters.',
    'any.required': 'Content is required.'
  }),
  mentions: Joi.array().items(Joi.string().uuid()).optional().allow(null),
});
export const fetchCommentSchema = CommentSchema.fork(
  Object.keys(CommentSchema.describe().keys),
  (schema) => schema.optional()
)

export const updateCommentSchema = Joi.object({
  content: Joi.string().required(),
  mentions: Joi.array().items(Joi.string().uuid()).optional().allow(null),

})
import Joi from 'joi';

export const userProjectSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  roleId: Joi.string().uuid().required(),
  isActive: Joi.boolean(),
}).unknown(false);

export const fetchAllUserProjectSchema = Joi.object({
    id: Joi.string().uuid().optional(),
    projectId: Joi.string().uuid().optional(),
    isActive: Joi.boolean(),
}).unknown(false)
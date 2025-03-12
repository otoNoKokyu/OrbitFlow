import Joi from 'joi';

export const creatProjectSchema = Joi.object({
  id: Joi.string().uuid().optional(),
  name: Joi.string().max(255).required(),
  start_date: Joi.alternatives().conditional('is_active', {
    is: true,
    then: Joi.date().required(),
    otherwise: Joi.date().optional().allow(null,'')
  }),
  end_date: Joi.date().optional().allow(null,''),
  min_issue_count: Joi.number().integer().min(0),
  owned_by: Joi.string().uuid().optional().allow(null),
  lead_by: Joi.string().uuid().optional().allow(null),
  is_active: Joi.boolean(),
  created_at: Joi.date().optional().allow(null),
  updated_at: Joi.date().optional().allow(null),
}).options({
  abortEarly:true
}).unknown(false)

export const fetchAllProjectSchmea = creatProjectSchema.fork(Object.keys(creatProjectSchema.describe().keys), (schema) =>schema.optional());

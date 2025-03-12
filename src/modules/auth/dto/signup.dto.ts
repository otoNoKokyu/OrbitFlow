import Joi from 'joi';

export const userSchema = Joi.object({
  user_id: Joi.string().uuid().optional(),
  username: Joi.string().max(50).required(),
  password_hash: Joi.string().max(255).required(),
  email: Joi.string().email().max(100).required(),
  first_name: Joi.string().max(50).optional(),
  last_name: Joi.string().max(50).optional(),
  date_of_birth: Joi.date().optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  phone_number: Joi.string().max(20).optional(),
  address: Joi.string().optional(),
  city: Joi.string().max(50).optional(),
  state: Joi.string().max(50).optional(),
  country: Joi.string().max(50).optional(),
  zip_code: Joi.string().max(20).optional(),
  profile_picture_url: Joi.string().uri().optional(),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional(),
  last_login: Joi.date().optional(),
  is_active: Joi.boolean().default(true),
  access_token: Joi.string().optional(),
  refresh_token: Joi.string().optional(),
  roleId: Joi.string().uuid().optional(),
  isInvited: Joi.boolean().default(false),
  invited_by: Joi.string().uuid().optional()
}).unknown(false);


import * as Joi from 'joi';

export const SignInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
});

export const ForgetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'any.required': 'Email is required.',
    }),
  newPassword: Joi.string()
    .min(8)
    .max(30)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.max': 'Password must not exceed 30 characters.',
      'string.pattern.base': 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
      'any.required': 'New password is required.',
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match new password.',
      'any.required': 'Confirm password is required.',
    }),
});

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

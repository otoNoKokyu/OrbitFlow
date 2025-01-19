import * as Joi from 'joi';

export class ForgetPasswordDto {
    email: string;
    newPassword: string;
    confirmPassword : string;
}

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


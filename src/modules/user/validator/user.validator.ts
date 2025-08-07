import Joi from 'joi';

export const EditProfileSchema = Joi.object({
    first_name: Joi.string().max(50).optional(),
    last_name: Joi.string().max(50).optional(),
    date_of_birth: Joi.date().optional(),
    email: Joi.string().email().max(100).optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    phone_number: Joi.string().max(20).optional(),
    address: Joi.string().optional(),
    city: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional(),
    country: Joi.string().max(50).optional(),
    zip_code: Joi.string().max(20).optional(),
    profile_picture_url: Joi.string().uri().optional(),
});

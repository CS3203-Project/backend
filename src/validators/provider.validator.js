import Joi from 'joi';

export const createProviderSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  logoUrl: Joi.string().uri().optional()
});

export const updateProviderSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  logoUrl: Joi.string().uri().optional()
});

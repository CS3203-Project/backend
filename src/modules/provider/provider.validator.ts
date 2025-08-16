import Joi from 'joi';

export const createProviderSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  logoUrl: Joi.string().uri().optional(),
  IDCardUrl: Joi.string().uri().required() // Required ID card image URL
});

export const updateProviderSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  logoUrl: Joi.string().uri().optional(),
  IDCardUrl: Joi.string().uri().optional() // Optional for updates
});

export const providerParamsSchema = Joi.object({
  id: Joi.string().required()
});

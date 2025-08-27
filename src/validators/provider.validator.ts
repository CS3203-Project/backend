import Joi from 'joi';

export const createProviderSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  logoUrl: Joi.string().optional(), // Allow any string format, not strict URI
  IDCardUrl: Joi.string().optional() // Optional during creation, allow spaces in URLs
});

export const updateProviderSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  qualifications: Joi.array().items(Joi.string()).optional(),
  logoUrl: Joi.string().optional(), // Allow any string format, not strict URI
  IDCardUrl: Joi.string().optional() // Optional for updates, allow spaces in URLs
});

export const providerParamsSchema = Joi.object({
  id: Joi.string().required()
});

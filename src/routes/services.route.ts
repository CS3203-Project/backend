import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/services.controller.js';
import validate from '../middlewares/validation.middleware.js';
import {
  createServiceSchema,
  updateServiceSchema,
  getServicesQuerySchema,
  serviceIdSchema
} from '../validators/services.validator.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router: import('express').Router = Router();

// Apply authentication middleware to all routes
// router.use(authMiddleware);

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Private (Service Provider only)
 */
router.post('/', validate(createServiceSchema), createService);

/**
 * @route   GET /api/services
 * @desc    Get all services with optional filtering
 * @access  Public
 */
router.get('/', validate(getServicesQuerySchema, 'query'), getServices);

/**
 * @route   GET /api/services/:id
 * @desc    Get a single service by ID
 * @access  Public
 */
router.get('/:id', validate(serviceIdSchema, 'params'), getServiceById);

/**
 * @route   PUT /api/services/:id
 * @desc    Update a service
 * @access  Private (Service Provider - own services only)
 */
router.put('/:id', 
  validate(serviceIdSchema, 'params'),
  validate(updateServiceSchema),
  updateService
);

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete a service
 * @access  Private (Service Provider - own services only)
 */
router.delete('/:id', validate(serviceIdSchema, 'params'), deleteService);

export default router;

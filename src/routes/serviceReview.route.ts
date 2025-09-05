import { Router } from 'express';
import {
  createServiceReviewController,
  getServiceReviewsController,
  getServiceReviewByIdController,
  updateServiceReviewController,
  deleteServiceReviewController
} from '../controllers/serviceReview.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router: import('express').Router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create a service review
router.post('/', createServiceReviewController);

// Get all reviews for a service
router.get('/service/:serviceId', getServiceReviewsController);

// Get a single review by id
router.get('/:reviewId', getServiceReviewByIdController);

// Update a review
router.patch('/:reviewId', updateServiceReviewController);

// Delete a review
router.delete('/:reviewId', deleteServiceReviewController);

export default router;

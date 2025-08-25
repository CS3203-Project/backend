import type { Request, Response, NextFunction } from 'express';
import {
  createReview,
  getCustomerReviews,
  getReviewsByProvider,
  getReviewById,
  updateReview,
  deleteReview,
  getCustomerStats
} from '../services/review.service.js';

export const createReviewController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewerId, revieweeId, rating, comment } = req.body;
    const review = await createReview({ reviewerId, revieweeId, rating, comment });
    res.status(201).json({ message: 'Review created', review });
  } catch (err) {
    next(err);
  }
};

export const getCustomerReviewsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const reviews = await getCustomerReviews(customerId, Number(page), Number(limit));
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

export const getReviewsByProviderController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const reviews = await getReviewsByProvider(providerId, Number(page), Number(limit));
    res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
};

export const getReviewByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const review = await getReviewById(reviewId);
    res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

export const updateReviewController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const reviewerId = req.body.reviewerId;
    const updateData = req.body;
    const review = await updateReview(reviewId, reviewerId, updateData);
    res.status(200).json({ message: 'Review updated', review });
  } catch (err) {
    next(err);
  }
};

export const deleteReviewController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const reviewerId = req.body.reviewerId;
    const result = await deleteReview(reviewId, reviewerId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCustomerStatsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const stats = await getCustomerStats(customerId);
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

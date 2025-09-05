import {
  createServiceReview,
  getServiceReviews,
  getServiceReviewById,
  updateServiceReview,
  deleteServiceReview,
  CreateServiceReviewData,
  UpdateServiceReviewData
} from '../services/serviceReview.service.js';
import { Request, Response } from 'express';

export const createServiceReviewController = async (req: Request, res: Response) => {
  try {
    const data: CreateServiceReviewData = req.body;
    // reviewerId should come from auth middleware (req.user.id)
    data.reviewerId = req.user.id;
    const review = await createServiceReview(data);
    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getServiceReviewsController = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const result = await getServiceReviews(serviceId, Number(page), Number(limit));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getServiceReviewByIdController = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const review = await getServiceReviewById(reviewId);
    res.json(review);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateServiceReviewController = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const data: UpdateServiceReviewData = req.body;
    const userId = req.user.id;
    const review = await updateServiceReview(reviewId, data, userId);
    res.json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteServiceReviewController = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const result = await deleteServiceReview(reviewId, userId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

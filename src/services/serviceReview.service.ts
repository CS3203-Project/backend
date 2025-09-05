// ServiceReview Service - mirrors customerReview.service.ts but for ServiceReview
import { prisma } from '../utils/database.js';

export interface CreateServiceReviewData {
  reviewerId: string; // customer id
  serviceId: string;
  rating: number;
  comment?: string;
}

export interface UpdateServiceReviewData {
  rating?: number;
  comment?: string;
}

export const createServiceReview = async (data: CreateServiceReviewData) => {
  // Prevent duplicate reviews by same user for same service
  const existing = await prisma.serviceReview.findFirst({
    where: { reviewerId: data.reviewerId, serviceId: data.serviceId }
  });
  if (existing) throw new Error('You have already reviewed this service.');
  return prisma.serviceReview.create({
    data,
    include: {
      reviewer: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      service: { select: { id: true, title: true } }
    }
  });
};

export const getServiceReviews = async (serviceId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.serviceReview.findMany({
      where: { serviceId },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
        service: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit
    }),
    prisma.serviceReview.count({ where: { serviceId } })
  ]);
  return { reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getServiceReviewById = async (reviewId: string) => {
  const review = await prisma.serviceReview.findUnique({
    where: { id: reviewId },
    include: {
      reviewer: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      service: { select: { id: true, title: true } }
    }
  });
  if (!review) throw new Error('Service review not found');
  return review;
};

export const updateServiceReview = async (reviewId: string, data: UpdateServiceReviewData, userId: string) => {
  const existing = await prisma.serviceReview.findUnique({ where: { id: reviewId } });
  if (!existing) throw new Error('Review not found');
  if (existing.reviewerId !== userId) throw new Error('Unauthorized');
  return prisma.serviceReview.update({
    where: { id: reviewId },
    data: { ...data, updatedAt: new Date() },
    include: {
      reviewer: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      service: { select: { id: true, title: true } }
    }
  });
};

export const deleteServiceReview = async (reviewId: string, userId: string) => {
  const existing = await prisma.serviceReview.findUnique({ where: { id: reviewId } });
  if (!existing) throw new Error('Review not found');
  if (existing.reviewerId !== userId) throw new Error('Unauthorized');
  await prisma.serviceReview.delete({ where: { id: reviewId } });
  return { message: 'Service review deleted successfully' };
};

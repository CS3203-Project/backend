import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateReviewData {
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface CustomerStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const createReview = async (data: CreateReviewData) => {
  try {
    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: data.reviewerId,
        revieweeId: data.revieweeId,
      },
    });

    if (existingReview) {
      throw new Error('Review already exists for this provider');
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        reviewerId: data.reviewerId,
        revieweeId: data.revieweeId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    // Update provider's average rating
    await updateProviderRating(data.revieweeId);

    return review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getCustomerReviews = async (customerId: string, page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          reviewerId: customerId,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          reviewerId: customerId,
        },
      }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting customer reviews:', error);
    throw error;
  }
};

export const getReviewsByProvider = async (providerId: string, page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          revieweeId: providerId,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          reviewee: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          revieweeId: providerId,
        },
      }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error getting provider reviews:', error);
    throw error;
  }
};

export const getReviewById = async (reviewId: string) => {
  try {
    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    return review;
  } catch (error) {
    console.error('Error getting review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId: string, data: UpdateReviewData, userId: string) => {
  try {
    // Check if review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    if (existingReview.reviewerId !== userId) {
      throw new Error('Unauthorized to update this review');
    }

    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        rating: data.rating,
        comment: data.comment,
        updatedAt: new Date(),
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    // Update provider's average rating
    await updateProviderRating(existingReview.revieweeId);

    return review;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: string, userId: string) => {
  try {
    // Check if review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      throw new Error('Review not found');
    }

    if (existingReview.reviewerId !== userId) {
      throw new Error('Unauthorized to delete this review');
    }

    const providerId = existingReview.revieweeId;

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    // Update provider's average rating
    await updateProviderRating(providerId);

    return { message: 'Review deleted successfully' };
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const getCustomerStats = async (customerId: string): Promise<CustomerStats> => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        reviewerId: customerId,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      ratingDistribution,
    };
  } catch (error) {
    console.error('Error getting customer stats:', error);
    throw error;
  }
};

// Helper function to update provider's average rating
const updateProviderRating = async (providerId: string) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: providerId,
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : null;

    await prisma.serviceProvider.update({
      where: {
        id: providerId,
      },
      data: {
        averageRating: averageRating,
        totalReviews: totalReviews,
      },
    });
  } catch (error) {
    console.error('Error updating provider rating:', error);
    // Don't throw error here as this is a background update
  }
};
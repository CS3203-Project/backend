import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createProvider = async (userId, providerData) => {
  // Check if user exists and doesn't already have a provider profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { serviceProvider: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.serviceProvider) {
    throw new Error('User already has a service provider profile');
  }

  // Update user role to PROVIDER and create ServiceProvider profile
  const [updatedUser, newProvider] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { role: 'PROVIDER' }
    }),
    prisma.serviceProvider.create({
      data: {
        userId,
        bio: providerData.bio,
        skills: providerData.skills || [],
        qualifications: providerData.qualifications || [],
        logoUrl: providerData.logoUrl,
        IDCardUrl: providerData.IDCardUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            role: true
          }
        }
      }
    })
  ]);

  return newProvider;
};

export const updateProvider = async (userId, providerData) => {
  // Check if user has a provider profile
  const existingProvider = await prisma.serviceProvider.findUnique({
    where: { userId }
  });

  if (!existingProvider) {
    throw new Error('Service provider profile not found');
  }

  const updatedData = {};
  if (providerData.bio !== undefined) updatedData.bio = providerData.bio;
  if (providerData.skills !== undefined) updatedData.skills = providerData.skills;
  if (providerData.qualifications !== undefined) updatedData.qualifications = providerData.qualifications;
  if (providerData.logoUrl !== undefined) updatedData.logoUrl = providerData.logoUrl;
  if (providerData.IDCardUrl !== undefined) updatedData.IDCardUrl = providerData.IDCardUrl;

  const updatedProvider = await prisma.serviceProvider.update({
    where: { userId },
    data: updatedData,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          role: true
        }
      },
      services: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          currency: true,
          images: true,
          isActive: true
        }
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }
    }
  });

  return updatedProvider;
};

export const deleteProvider = async (userId) => {
  // Check if user has a provider profile
  const existingProvider = await prisma.serviceProvider.findUnique({
    where: { userId },
    include: {
      services: true,
      schedules: true,
      payments: true,
      reviews: true
    }
  });

  if (!existingProvider) {
    throw new Error('Service provider profile not found');
  }

  // Check for active dependencies
  const activeServices = existingProvider.services.filter(service => service.isActive);
  if (activeServices.length > 0) {
    throw new Error('Cannot delete provider with active services. Please deactivate all services first.');
  }

  const pendingSchedules = existingProvider.schedules.filter(schedule => !schedule.confirm);
  if (pendingSchedules.length > 0) {
    throw new Error('Cannot delete provider with pending schedules.');
  }

  // Delete provider and update user role back to USER
  await prisma.$transaction([
    prisma.serviceProvider.delete({
      where: { userId }
    }),
    prisma.user.update({
      where: { id: userId },
      data: { role: 'USER' }
    })
  ]);

  return { message: 'Service provider profile deleted successfully' };
};

export const getProviderProfile = async (userId) => {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          role: true,
          phone: true,
          location: true,
          address: true,
          socialmedia: true,
          createdAt: true,
          isEmailVerified: true
        }
      },
      services: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          currency: true,
          images: true,
          isActive: true,
          tags: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          reviewer: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!provider) {
    throw new Error('Service provider profile not found');
  }

  return provider;
};

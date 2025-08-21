
import { prisma } from '../utils/database.js';
import jwt from 'jsonwebtoken';
import { comparePassword, hashPassword } from '../utils/hash.js';

// Type definitions
interface UserRegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  imageUrl?: string;
  location?: string;
  address?: string;
  phone?: string;
  socialmedia?: any;
}

interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  location?: string;
  address?: string;
  phone?: string;
  socialmedia?: any;
}

// Extend Error interface to include status property
interface ErrorWithStatus extends Error {
  status?: number;
}

export const register = async ({ email, firstName, lastName, password, imageUrl, location, address, phone, socialmedia }: UserRegistrationData) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const err = new Error('Email already exists. Please use a different email address.') as ErrorWithStatus;
    err.name = 'BadRequestError'; 
    err.status = 400; 
    throw err;
  }
  const hashedPassword = await hashPassword(password);
  return await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      password: hashedPassword,
      imageUrl,
      location,
      address,
      phone,
      socialmedia,
    },
  });
};

export const createAdmin = async ({ email, firstName, lastName, password, imageUrl, location, address, phone, socialmedia }: UserRegistrationData) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const err = new Error('Email already exists. Please use a different email address.') as ErrorWithStatus;
    err.name = 'BadRequestError'; 
    err.status = 400; 
    throw err;
  }
  
  const hashedPassword = await hashPassword(password);
  const adminUser = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'ADMIN', // Set role to ADMIN
      imageUrl,
      location,
      address,
      phone,
      socialmedia,
      isEmailVerified: true, // Admins are auto-verified
    },
  });

  // Return user data without password
  const { password: _, ...adminUserWithoutPassword } = adminUser;
  return adminUserWithoutPassword;
};

export const login = async ({ email, password }: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token, user };
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      location: true,
      address: true,
      phone: true,
      socialmedia: true,
      createdAt: true,
      isEmailVerified: true,
    },
  });
  
  if (!user) throw new Error('User not found');
  
  // Fetch service provider data separately to avoid heavy joins
  let serviceProvider = null;
  if (user.role === 'PROVIDER' || user.role === 'ADMIN') {
    serviceProvider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: {
        id: true,
        bio: true,
        skills: true,
        qualifications: true,
        logoUrl: true,
        averageRating: true,
        totalReviews: true,
      },
    });
    
    // Get services count instead of full services for better performance
    if (serviceProvider) {
      const servicesCount = await prisma.service.count({
        where: { providerId: serviceProvider.id, isActive: true }
      });
      
      // Get latest 5 reviews for quick display
      const recentReviews = await prisma.review.findMany({
        where: { revieweeId: serviceProvider.id },
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
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      serviceProvider = {
        ...serviceProvider,
        servicesCount,
        recentReviews
      };
    }
  }
  
  return { ...user, serviceProvider };
}

export const updateProfile = async (userId: string, data: UserUpdateData) => {
  const updatedData: any = {};
  if (data.firstName) updatedData.firstName = data.firstName;
  if (data.lastName) updatedData.lastName = data.lastName;
  if (data.imageUrl) updatedData.imageUrl = data.imageUrl;
  if (data.location) updatedData.location = data.location;
  if (data.address) updatedData.address = data.address;
  if (data.phone) updatedData.phone = data.phone;
  if (data.socialmedia) updatedData.socialmedia = data.socialmedia;

  return await prisma.user.update({
    where: { id: userId },
    data: updatedData,
  });
}

export const deleteProfile = async (userId: string) => {
  await prisma.user.delete({
    where: { id: userId },
  });
}

export const checkEmailExists = async (email: string) => {
  const user = await prisma.user.findUnique({ 
    where: { email },
    select: { id: true } // Only select id for minimal data transfer
  });
  return !!user;
}

export const searchUsers = async (query: string) => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
    },
    take: 20, // Limit results to prevent performance issues
  });
  return users;
}
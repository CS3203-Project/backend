// User domain types
import { BaseEntity, UserRole } from '../shared/types/common.js';

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  imageUrl?: string;
  location?: string;
  address?: string;
  phone?: string;
  socialmedia?: Record<string, string>;
  serviceProvider?: ServiceProvider;
}

export interface ServiceProvider extends BaseEntity {
  userId: string;
  bio?: string;
  skills: string[];
  qualifications: string[];
  logoUrl?: string;
  IDCardUrl?: string;
  user: User;
}

export interface UserRegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  imageUrl?: string;
  location?: string;
  address?: string;
  phone?: string;
  socialmedia?: Record<string, string>;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  location?: string;
  address?: string;
  phone?: string;
  socialmedia?: Record<string, string>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}
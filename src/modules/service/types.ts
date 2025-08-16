// Service domain types
import { BaseEntity } from '../shared/types/common.js';
import { User } from '../user/types.js';
import { Category } from '../category/types.js';

export interface Service extends BaseEntity {
  title: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  providerId: string;
  imageUrls: string[];
  location?: string;
  isActive: boolean;
  category?: Category;
  provider?: ServiceProvider;
  reviews?: Review[];
  _count?: {
    reviews: number;
  };
}

export interface ServiceProvider extends BaseEntity {
  userId: string;
  bio?: string;
  skills: string[];
  qualifications: string[];
  logoUrl?: string;
  IDCardUrl?: string;
  user: User;
  services?: Service[];
  reviews?: Review[];
}

export interface Review extends BaseEntity {
  rating: number;
  comment?: string;
  serviceId: string;
  reviewerId: string;
  service?: Service;
  reviewer?: User;
}

export interface ServiceCreateData {
  title: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  imageUrls?: string[];
  location?: string;
}

export interface ServiceUpdateData {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  imageUrls?: string[];
  location?: string;
  isActive?: boolean;
}

export interface ServiceFilters {
  categoryId?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  isActive?: boolean;
}
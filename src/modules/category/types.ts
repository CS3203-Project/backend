// Category domain types
import { BaseEntity } from '../shared/types/common.js';

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  services?: Service[];
  _count?: {
    children: number;
    services: number;
  };
}

export interface CategoryCreateData {
  name?: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface CategoryUpdateData {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
}

export interface CategoryFilters {
  parentId?: string | null;
  includeChildren?: boolean;
  includeParent?: boolean;
  includeServices?: boolean;
}

export interface CategoryOptions {
  includeChildren?: boolean;
  includeParent?: boolean;
  includeServices?: boolean;
}

export interface DeleteOptions {
  force?: boolean;
}

export interface SearchOptions {
  includeChildren?: boolean;
  includeParent?: boolean;
}

export interface RootCategoryOptions {
  includeChildren?: boolean;
}

// Placeholder for Service interface - will be defined in service module
interface Service {
  id: string;
  title: string;
  categoryId: string;
}
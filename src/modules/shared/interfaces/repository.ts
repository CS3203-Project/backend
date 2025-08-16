// Repository pattern interfaces for data access layer abstraction

export interface BaseRepository<T, CreateData, UpdateData> {
  create(data: CreateData): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: any): Promise<T[]>;
  update(id: string, data: UpdateData): Promise<T>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface UserRepository extends BaseRepository<any, any, any> {
  findByEmail(email: string): Promise<any | null>;
  search(query: string): Promise<any[]>;
}

export interface CategoryRepository extends BaseRepository<any, any, any> {
  findBySlug(slug: string): Promise<any | null>;
  findRoots(): Promise<any[]>;
  findChildren(parentId: string): Promise<any[]>;
  search(query: string): Promise<any[]>;
  getHierarchy(id: string): Promise<any | null>;
}

export interface ServiceRepository extends BaseRepository<any, any, any> {
  findByCategory(categoryId: string): Promise<any[]>;
  findByProvider(providerId: string): Promise<any[]>;
  search(filters: any): Promise<any[]>;
}

// Generic query interface
export interface QueryOptions {
  include?: Record<string, boolean | QueryOptions>;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  take?: number;
  skip?: number;
}
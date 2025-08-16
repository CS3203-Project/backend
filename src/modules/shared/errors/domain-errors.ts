// Domain error classes for better error handling

export abstract class DomainError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;
  
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  readonly status = 400;
  readonly code = 'VALIDATION_ERROR';
}

export class NotFoundError extends DomainError {
  readonly status = 404;
  readonly code = 'NOT_FOUND';
}

export class ConflictError extends DomainError {
  readonly status = 409;
  readonly code = 'CONFLICT';
}

export class UnauthorizedError extends DomainError {
  readonly status = 401;
  readonly code = 'UNAUTHORIZED';
}

export class ForbiddenError extends DomainError {
  readonly status = 403;
  readonly code = 'FORBIDDEN';
}

export class InternalServerError extends DomainError {
  readonly status = 500;
  readonly code = 'INTERNAL_SERVER_ERROR';
}

// Domain-specific errors
export class UserNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `User with ID ${id} not found` : 'User not found');
  }
}

export class CategoryNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Category with ID ${id} not found` : 'Category not found');
  }
}

export class ServiceNotFoundError extends NotFoundError {
  constructor(id?: string) {
    super(id ? `Service with ID ${id} not found` : 'Service not found');
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class SlugAlreadyExistsError extends ConflictError {
  constructor(slug: string) {
    super(`Category with slug ${slug} already exists`);
  }
}

export class CircularReferenceError extends ValidationError {
  constructor() {
    super('Cannot create circular reference in category hierarchy');
  }
}
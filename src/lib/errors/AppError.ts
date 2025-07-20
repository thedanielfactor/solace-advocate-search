// Base error class for application errors
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Database related errors
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', code: string = 'DATABASE_ERROR') {
    super(message, 500, code);
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string = 'Database connection failed') {
    super(message, 'DATABASE_CONNECTION_ERROR');
  }
}

export class DatabaseQueryError extends DatabaseError {
  constructor(message: string = 'Database query failed') {
    super(message, 'DATABASE_QUERY_ERROR');
  }
}

// Validation errors
export class ValidationError extends AppError {
  public readonly field?: string | undefined;
  public readonly value?: any;

  constructor(
    message: string = 'Validation failed',
    field?: string,
    value?: any,
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message, 400, code);
    this.field = field;
    this.value = value;
  }
}

export class RequiredFieldError extends ValidationError {
  constructor(field: string) {
    super(`Field '${field}' is required`, field, undefined, 'REQUIRED_FIELD_ERROR');
  }
}

export class InvalidFormatError extends ValidationError {
  constructor(field: string, value: any, expectedFormat: string) {
    super(
      `Field '${field}' has invalid format. Expected: ${expectedFormat}`,
      field,
      value,
      'INVALID_FORMAT_ERROR'
    );
  }
}

export class InvalidRangeError extends ValidationError {
  constructor(field: string, value: any, min?: number, max?: number) {
    const range = min !== undefined && max !== undefined 
      ? `between ${min} and ${max}`
      : min !== undefined 
        ? `greater than or equal to ${min}`
        : `less than or equal to ${max}`;
    
    super(
      `Field '${field}' must be ${range}`,
      field,
      value,
      'INVALID_RANGE_ERROR'
    );
  }
}

// Resource errors
export class ResourceNotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(message, 404, 'RESOURCE_NOT_FOUND');
  }
}

export class ResourceAlreadyExistsError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' already exists`
      : `${resource} already exists`;
    
    super(message, 409, 'RESOURCE_ALREADY_EXISTS');
  }
}

// Authorization and authentication errors
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

// Request errors
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class InvalidParameterError extends AppError {
  public readonly parameter: string;

  constructor(parameter: string, message?: string) {
    super(
      message || `Invalid parameter: ${parameter}`,
      400,
      'INVALID_PARAMETER'
    );
    this.parameter = parameter;
  }
}

// Rate limiting and throttling
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// Service errors
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

// Error factory for creating specific error types
export class ErrorFactory {
  static createDatabaseError(message?: string): DatabaseError {
    return new DatabaseError(message);
  }

  static createValidationError(field: string, message?: string): ValidationError {
    return new ValidationError(message || `Validation failed for field: ${field}`, field);
  }

  static createNotFoundError(resource: string, identifier?: string | number): ResourceNotFoundError {
    return new ResourceNotFoundError(resource, identifier);
  }

  static createBadRequestError(message?: string): BadRequestError {
    return new BadRequestError(message);
  }

  static createInvalidParameterError(parameter: string, message?: string): InvalidParameterError {
    return new InvalidParameterError(parameter, message);
  }
}

// Error response interface
export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  statusCode: number;
  field?: string | undefined;
  parameter?: string | undefined;
  timestamp: string;
  path?: string | undefined;
}

// Helper function to convert AppError to ErrorResponse
export function toErrorResponse(error: AppError, path?: string): ErrorResponse {
  const response: ErrorResponse = {
    error: error.constructor.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path
  };

  if (error instanceof ValidationError && error.field) {
    response.field = error.field;
  }

  if (error instanceof InvalidParameterError) {
    response.parameter = error.parameter;
  }

  return response;
}

// Helper function to handle unknown errors
export function handleUnknownError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new DatabaseError(error.message);
  }

  return new DatabaseError('An unknown error occurred');
} 
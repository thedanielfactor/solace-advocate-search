import {
  AppError,
  DatabaseError,
  DatabaseConnectionError,
  DatabaseQueryError,
  ValidationError,
  RequiredFieldError,
  InvalidFormatError,
  InvalidRangeError,
  ResourceNotFoundError,
  ResourceAlreadyExistsError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  InvalidParameterError,
  RateLimitError,
  ServiceUnavailableError,
  ErrorFactory,
  toErrorResponse,
  handleUnknownError,
  type ErrorResponse
} from '../AppError';

describe('AppError', () => {
  describe('base AppError class', () => {
    it('should create AppError with default values', () => {
      const error = new DatabaseError();
      
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create AppError with custom values', () => {
      const error = new DatabaseError('Custom message', 'CUSTOM_CODE');
      
      expect(error.message).toBe('Custom message');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.isOperational).toBe(true);
    });

    it('should maintain stack trace', () => {
      const error = new DatabaseError();
      
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError with default message', () => {
      const error = new DatabaseError();
      
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });

    it('should create DatabaseError with custom message', () => {
      const error = new DatabaseError('Custom database error');
      
      expect(error.message).toBe('Custom database error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('DatabaseConnectionError', () => {
    it('should create DatabaseConnectionError', () => {
      const error = new DatabaseConnectionError();
      
      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_CONNECTION_ERROR');
    });

    it('should create DatabaseConnectionError with custom message', () => {
      const error = new DatabaseConnectionError('Custom connection error');
      
      expect(error.message).toBe('Custom connection error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_CONNECTION_ERROR');
    });
  });

  describe('DatabaseQueryError', () => {
    it('should create DatabaseQueryError', () => {
      const error = new DatabaseQueryError();
      
      expect(error.message).toBe('Database query failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_QUERY_ERROR');
    });

    it('should create DatabaseQueryError with custom message', () => {
      const error = new DatabaseQueryError('Custom query error');
      
      expect(error.message).toBe('Custom query error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_QUERY_ERROR');
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with default values', () => {
      const error = new ValidationError();
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBeUndefined();
      expect(error.value).toBeUndefined();
    });

    it('should create ValidationError with custom values', () => {
      const error = new ValidationError('Custom validation error', 'email', 'invalid@');
      
      expect(error.message).toBe('Custom validation error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid@');
    });
  });

  describe('RequiredFieldError', () => {
    it('should create RequiredFieldError', () => {
      const error = new RequiredFieldError('email');
      
      expect(error.message).toBe("Field 'email' is required");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('REQUIRED_FIELD_ERROR');
      expect(error.field).toBe('email');
      expect(error.value).toBeUndefined();
    });
  });

  describe('InvalidFormatError', () => {
    it('should create InvalidFormatError', () => {
      const error = new InvalidFormatError('email', 'invalid@', 'valid@example.com');
      
      expect(error.message).toBe("Field 'email' has invalid format. Expected: valid@example.com");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_FORMAT_ERROR');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid@');
    });
  });

  describe('InvalidRangeError', () => {
    it('should create InvalidRangeError with min and max', () => {
      const error = new InvalidRangeError('age', 25, 18, 65);
      
      expect(error.message).toBe("Field 'age' must be between 18 and 65");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_RANGE_ERROR');
      expect(error.field).toBe('age');
      expect(error.value).toBe(25);
    });

    it('should create InvalidRangeError with only min', () => {
      const error = new InvalidRangeError('age', 15, 18);
      
      expect(error.message).toBe("Field 'age' must be greater than or equal to 18");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_RANGE_ERROR');
      expect(error.field).toBe('age');
      expect(error.value).toBe(15);
    });

    it('should create InvalidRangeError with only max', () => {
      const error = new InvalidRangeError('age', 70, undefined, 65);
      
      expect(error.message).toBe("Field 'age' must be less than or equal to 65");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_RANGE_ERROR');
      expect(error.field).toBe('age');
      expect(error.value).toBe(70);
    });
  });

  describe('ResourceNotFoundError', () => {
    it('should create ResourceNotFoundError without identifier', () => {
      const error = new ResourceNotFoundError('User');
      
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('should create ResourceNotFoundError with identifier', () => {
      const error = new ResourceNotFoundError('User', 123);
      
      expect(error.message).toBe("User with identifier '123' not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('should create ResourceNotFoundError with string identifier', () => {
      const error = new ResourceNotFoundError('User', 'john@example.com');
      
      expect(error.message).toBe("User with identifier 'john@example.com' not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('RESOURCE_NOT_FOUND');
    });
  });

  describe('ResourceAlreadyExistsError', () => {
    it('should create ResourceAlreadyExistsError without identifier', () => {
      const error = new ResourceAlreadyExistsError('User');
      
      expect(error.message).toBe('User already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('RESOURCE_ALREADY_EXISTS');
    });

    it('should create ResourceAlreadyExistsError with identifier', () => {
      const error = new ResourceAlreadyExistsError('User', 123);
      
      expect(error.message).toBe("User with identifier '123' already exists");
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('RESOURCE_ALREADY_EXISTS');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create UnauthorizedError with default message', () => {
      const error = new UnauthorizedError();
      
      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create UnauthorizedError with custom message', () => {
      const error = new UnauthorizedError('Invalid credentials');
      
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('ForbiddenError', () => {
    it('should create ForbiddenError with default message', () => {
      const error = new ForbiddenError();
      
      expect(error.message).toBe('Access forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create ForbiddenError with custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');
      
      expect(error.message).toBe('Insufficient permissions');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('BadRequestError', () => {
    it('should create BadRequestError with default message', () => {
      const error = new BadRequestError();
      
      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should create BadRequestError with custom message', () => {
      const error = new BadRequestError('Invalid request format');
      
      expect(error.message).toBe('Invalid request format');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });
  });

  describe('InvalidParameterError', () => {
    it('should create InvalidParameterError with default message', () => {
      const error = new InvalidParameterError('id');
      
      expect(error.message).toBe('Invalid parameter: id');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_PARAMETER');
      expect(error.parameter).toBe('id');
    });

    it('should create InvalidParameterError with custom message', () => {
      const error = new InvalidParameterError('id', 'ID must be a positive integer');
      
      expect(error.message).toBe('ID must be a positive integer');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID_PARAMETER');
      expect(error.parameter).toBe('id');
    });
  });

  describe('RateLimitError', () => {
    it('should create RateLimitError with default message', () => {
      const error = new RateLimitError();
      
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should create RateLimitError with custom message', () => {
      const error = new RateLimitError('Too many requests per minute');
      
      expect(error.message).toBe('Too many requests per minute');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create ServiceUnavailableError with default message', () => {
      const error = new ServiceUnavailableError();
      
      expect(error.message).toBe('Service temporarily unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should create ServiceUnavailableError with custom message', () => {
      const error = new ServiceUnavailableError('Database maintenance in progress');
      
      expect(error.message).toBe('Database maintenance in progress');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('ErrorFactory', () => {
    describe('createDatabaseError', () => {
      it('should create DatabaseError with default message', () => {
        const error = ErrorFactory.createDatabaseError();
        
        expect(error).toBeInstanceOf(DatabaseError);
        expect(error.message).toBe('Database operation failed');
      });

      it('should create DatabaseError with custom message', () => {
        const error = ErrorFactory.createDatabaseError('Connection timeout');
        
        expect(error).toBeInstanceOf(DatabaseError);
        expect(error.message).toBe('Connection timeout');
      });
    });

    describe('createValidationError', () => {
      it('should create ValidationError with default message', () => {
        const error = ErrorFactory.createValidationError('email');
        
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Validation failed for field: email');
        expect(error.field).toBe('email');
      });

      it('should create ValidationError with custom message', () => {
        const error = ErrorFactory.createValidationError('email', 'Invalid email format');
        
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Invalid email format');
        expect(error.field).toBe('email');
      });
    });

    describe('createNotFoundError', () => {
      it('should create ResourceNotFoundError without identifier', () => {
        const error = ErrorFactory.createNotFoundError('User');
        
        expect(error).toBeInstanceOf(ResourceNotFoundError);
        expect(error.message).toBe('User not found');
      });

      it('should create ResourceNotFoundError with identifier', () => {
        const error = ErrorFactory.createNotFoundError('User', 123);
        
        expect(error).toBeInstanceOf(ResourceNotFoundError);
        expect(error.message).toBe("User with identifier '123' not found");
      });
    });

    describe('createBadRequestError', () => {
      it('should create BadRequestError with default message', () => {
        const error = ErrorFactory.createBadRequestError();
        
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toBe('Bad request');
      });

      it('should create BadRequestError with custom message', () => {
        const error = ErrorFactory.createBadRequestError('Invalid request body');
        
        expect(error).toBeInstanceOf(BadRequestError);
        expect(error.message).toBe('Invalid request body');
      });
    });

    describe('createInvalidParameterError', () => {
      it('should create InvalidParameterError with default message', () => {
        const error = ErrorFactory.createInvalidParameterError('id');
        
        expect(error).toBeInstanceOf(InvalidParameterError);
        expect(error.message).toBe('Invalid parameter: id');
        expect(error.parameter).toBe('id');
      });

      it('should create InvalidParameterError with custom message', () => {
        const error = ErrorFactory.createInvalidParameterError('id', 'ID must be numeric');
        
        expect(error).toBeInstanceOf(InvalidParameterError);
        expect(error.message).toBe('ID must be numeric');
        expect(error.parameter).toBe('id');
      });
    });
  });

  describe('toErrorResponse', () => {
    it('should convert AppError to ErrorResponse', () => {
      const error = new ValidationError('Invalid email', 'email', 'invalid@');
      const response = toErrorResponse(error, '/api/users');
      
      expect(response).toEqual({
        error: 'ValidationError',
        message: 'Invalid email',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        field: 'email',
        parameter: undefined,
        timestamp: expect.any(String),
        path: '/api/users'
      });
    });

    it('should convert InvalidParameterError to ErrorResponse', () => {
      const error = new InvalidParameterError('id', 'Invalid ID format');
      const response = toErrorResponse(error, '/api/users');
      
      expect(response).toEqual({
        error: 'InvalidParameterError',
        message: 'Invalid ID format',
        code: 'INVALID_PARAMETER',
        statusCode: 400,
        field: undefined,
        parameter: 'id',
        timestamp: expect.any(String),
        path: '/api/users'
      });
    });

    it('should convert AppError without optional fields', () => {
      const error = new DatabaseError('Connection failed');
      const response = toErrorResponse(error);
      
      expect(response).toEqual({
        error: 'DatabaseError',
        message: 'Connection failed',
        code: 'DATABASE_ERROR',
        statusCode: 500,
        field: undefined,
        parameter: undefined,
        timestamp: expect.any(String),
        path: undefined
      });
    });

    it('should generate valid ISO timestamp', () => {
      const error = new DatabaseError();
      const response = toErrorResponse(error);
      
      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('handleUnknownError', () => {
    it('should return AppError as is', () => {
      const originalError = new ValidationError('Test error');
      const handledError = handleUnknownError(originalError);
      
      expect(handledError).toBe(originalError);
    });

    it('should convert Error to DatabaseError', () => {
      const originalError = new Error('Some error occurred');
      const handledError = handleUnknownError(originalError);
      
      expect(handledError).toBeInstanceOf(DatabaseError);
      expect(handledError.message).toBe('Some error occurred');
      expect(handledError.statusCode).toBe(500);
    });

    it('should convert unknown error to DatabaseError', () => {
      const originalError = 'String error';
      const handledError = handleUnknownError(originalError);
      
      expect(handledError).toBeInstanceOf(DatabaseError);
      expect(handledError.message).toBe('An unknown error occurred');
      expect(handledError.statusCode).toBe(500);
    });

    it('should convert null to DatabaseError', () => {
      const handledError = handleUnknownError(null);
      
      expect(handledError).toBeInstanceOf(DatabaseError);
      expect(handledError.message).toBe('An unknown error occurred');
      expect(handledError.statusCode).toBe(500);
    });

    it('should convert undefined to DatabaseError', () => {
      const handledError = handleUnknownError(undefined);
      
      expect(handledError).toBeInstanceOf(DatabaseError);
      expect(handledError.message).toBe('An unknown error occurred');
      expect(handledError.statusCode).toBe(500);
    });
  });

  describe('Error inheritance', () => {
    it('should maintain proper inheritance chain', () => {
      const databaseError = new DatabaseError();
      const validationError = new ValidationError();
      const resourceError = new ResourceNotFoundError('User');
      
      expect(databaseError).toBeInstanceOf(AppError);
      expect(databaseError).toBeInstanceOf(Error);
      
      expect(validationError).toBeInstanceOf(AppError);
      expect(validationError).toBeInstanceOf(Error);
      
      expect(resourceError).toBeInstanceOf(AppError);
      expect(resourceError).toBeInstanceOf(Error);
    });

    it('should have correct instanceof relationships', () => {
      const databaseError = new DatabaseError();
      const validationError = new ValidationError();
      const resourceError = new ResourceNotFoundError('User');
      
      expect(databaseError instanceof AppError).toBe(true);
      expect(validationError instanceof AppError).toBe(true);
      expect(resourceError instanceof AppError).toBe(true);
      
      expect(databaseError instanceof Error).toBe(true);
      expect(validationError instanceof Error).toBe(true);
      expect(resourceError instanceof Error).toBe(true);
    });
  });
}); 
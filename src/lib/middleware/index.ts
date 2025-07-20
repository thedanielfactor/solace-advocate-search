import { z } from 'zod';
import { 
  validateGetAdvocates, 
  validateGetAdvocateById, 
  validateGetAdvocatesByCity,
  createValidationMiddleware 
} from './validation';
import { Sanitizer, sanitizeSearchParams } from './sanitization';
import { InvalidParameterError } from '../errors/AppError';

// Combined middleware that validates and sanitizes requests
export class DataProtectionMiddleware {
  /**
   * Middleware for GET /api/advocates endpoint
   */
  static async validateAndSanitizeGetAdvocates(request: Request) {
    try {
      // Create a copy of the original request to avoid modifying it
      const originalUrl = new URL(request.url);
      const originalSearchParams = new URLSearchParams(originalUrl.search);
      
      // First sanitize the search parameters
      const sanitizedParams = sanitizeSearchParams(originalSearchParams);
      
      // Create a new request with sanitized parameters for processing
      const sanitizedUrl = new URL(request.url);
      sanitizedUrl.search = sanitizedParams.toString();
      const sanitizedRequest = new Request(sanitizedUrl.toString(), request);
      
      // Then validate the sanitized parameters
      const validatedData = validateGetAdvocates(sanitizedRequest);
      
      return {
        request: sanitizedRequest,
        data: validatedData,
        originalRequest: request // Keep original request completely unchanged
      };
    } catch (error) {
      if (error instanceof InvalidParameterError) {
        throw error;
      }
      throw new InvalidParameterError('request', 'Failed to process request parameters');
    }
  }

  /**
   * Middleware for GET /api/advocates/[id] endpoint
   */
  static async validateAndSanitizeGetAdvocateById(request: Request) {
    try {
      // First sanitize the search parameters
      const url = new URL(request.url);
      const sanitizedParams = sanitizeSearchParams(url.searchParams);
      
      // Create a new request with sanitized parameters
      const sanitizedUrl = new URL(request.url);
      sanitizedUrl.search = sanitizedParams.toString();
      const sanitizedRequest = new Request(sanitizedUrl.toString(), request);
      
      // Then validate the sanitized parameters
      const validatedData = validateGetAdvocateById(sanitizedRequest);
      
      return {
        request: sanitizedRequest,
        data: validatedData,
        originalRequest: request
      };
    } catch (error) {
      if (error instanceof InvalidParameterError) {
        throw error;
      }
      throw new InvalidParameterError('request', 'Failed to process request parameters');
    }
  }

  /**
   * Middleware for GET /api/advocates/city endpoint
   */
  static async validateAndSanitizeGetAdvocatesByCity(request: Request) {
    try {
      // First sanitize the search parameters
      const url = new URL(request.url);
      const sanitizedParams = sanitizeSearchParams(url.searchParams);
      
      // Create a new request with sanitized parameters
      const sanitizedUrl = new URL(request.url);
      sanitizedUrl.search = sanitizedParams.toString();
      const sanitizedRequest = new Request(sanitizedUrl.toString(), request);
      
      // Then validate the sanitized parameters
      const validatedData = validateGetAdvocatesByCity(sanitizedRequest);
      
      return {
        request: sanitizedRequest,
        data: validatedData,
        originalRequest: request
      };
    } catch (error) {
      if (error instanceof InvalidParameterError) {
        throw error;
      }
      throw new InvalidParameterError('request', 'Failed to process request parameters');
    }
  }

  /**
   * Generic middleware factory for any endpoint
   */
  static createMiddleware<T extends z.ZodSchema>(
    schema: T,
    errorMessage: string = 'Invalid request parameters'
  ) {
    return async function validateAndSanitize(request: Request) {
      try {
        // First sanitize the search parameters
        const url = new URL(request.url);
        const sanitizedParams = sanitizeSearchParams(url.searchParams);
        
        // Create a new request with sanitized parameters
        const sanitizedUrl = new URL(request.url);
        sanitizedUrl.search = sanitizedParams.toString();
        const sanitizedRequest = new Request(sanitizedUrl.toString(), request);
        
        // Then validate the sanitized parameters
        const validatedData = createValidationMiddleware(schema, errorMessage)(sanitizedRequest);
        
        return {
          request: sanitizedRequest,
          data: validatedData,
          originalRequest: request
        };
      } catch (error) {
        if (error instanceof InvalidParameterError) {
          throw error;
        }
        throw new InvalidParameterError('request', 'Failed to process request parameters');
      }
    };
  }

  /**
   * Utility function to sanitize and validate any input
   */
  static sanitizeAndValidate<T>(
    input: T,
    sanitizer: (input: T) => T,
    validator: (input: T) => T
  ): T {
    const sanitized = sanitizer(input);
    return validator(sanitized);
  }
}

// Export individual middleware functions for convenience
export const validateAndSanitizeGetAdvocates = DataProtectionMiddleware.validateAndSanitizeGetAdvocates;
export const validateAndSanitizeGetAdvocateById = DataProtectionMiddleware.validateAndSanitizeGetAdvocateById;
export const validateAndSanitizeGetAdvocatesByCity = DataProtectionMiddleware.validateAndSanitizeGetAdvocatesByCity;

// Export the sanitizer and validation utilities
export { Sanitizer } from './sanitization';
export { 
  validateGetAdvocates, 
  validateGetAdvocateById, 
  validateGetAdvocatesByCity,
  createValidationMiddleware 
} from './validation'; 
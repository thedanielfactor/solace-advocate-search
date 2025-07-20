import { 
  DataProtectionMiddleware,
  validateAndSanitizeGetAdvocates,
  validateAndSanitizeGetAdvocateById,
  validateAndSanitizeGetAdvocatesByCity
} from '../index';
import { InvalidParameterError } from '../../errors/AppError';

describe('Data Protection Middleware', () => {
  describe('validateAndSanitizeGetAdvocates', () => {
    it('should validate and sanitize valid requests', async () => {
      const request = new Request('http://localhost/api/advocates?page=1&limit=20&search=  doctor  &city=  New York  ');
      
      const result = await validateAndSanitizeGetAdvocates(request);
      
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.search).toBe('doctor');
      expect(result.data.city).toBe('New York');
      expect(result.request).toBeInstanceOf(Request);
      expect(result.originalRequest).toBe(request);
    });

    it('should handle requests with no parameters', async () => {
      const request = new Request('http://localhost/api/advocates');
      
      const result = await validateAndSanitizeGetAdvocates(request);
      
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortBy).toBe('lastName');
      expect(result.data.sortOrder).toBe('asc');
    });

    it('should sanitize XSS attempts in search terms', async () => {
      const request = new Request('http://localhost/api/advocates?search=<script>alert(1)</script>');
      
      const result = await validateAndSanitizeGetAdvocates(request);
      
      // After sanitization, the search term should be undefined or not contain dangerous content
      if (result.data.search) {
        expect(result.data.search).not.toContain('<script>');
        expect(result.data.search).not.toContain('alert(1)');
      }
    });

    it('should sanitize SQL injection attempts', async () => {
      const request = new Request('http://localhost/api/advocates?search=doctor UNION SELECT * FROM users');
      
      const result = await validateAndSanitizeGetAdvocates(request);
      
      // After sanitization, the search term should be undefined or not contain dangerous content
      if (result.data.search) {
        expect(result.data.search).not.toContain('UNION');
        expect(result.data.search).not.toContain('SELECT');
      }
    });

    it('should throw error for invalid pagination parameters', async () => {
      const request = new Request('http://localhost/api/advocates?page=0&limit=101');
      
      await expect(validateAndSanitizeGetAdvocates(request)).rejects.toThrow(InvalidParameterError);
    });

    it('should throw error for invalid experience ranges', async () => {
      const request = new Request('http://localhost/api/advocates?minExperience=15&maxExperience=10');
      
      await expect(validateAndSanitizeGetAdvocates(request)).rejects.toThrow(InvalidParameterError);
    });

    it('should throw error for invalid sort parameters', async () => {
      const request = new Request('http://localhost/api/advocates?sortBy=invalid&sortOrder=invalid');
      
      await expect(validateAndSanitizeGetAdvocates(request)).rejects.toThrow(InvalidParameterError);
    });
  });

  describe('validateAndSanitizeGetAdvocateById', () => {
    it('should validate and sanitize valid requests', async () => {
      const request = new Request('http://localhost/api/advocates/123?id=123');
      
      const result = await validateAndSanitizeGetAdvocateById(request);
      
      expect(result.data.id).toBe(123);
      expect(result.request).toBeInstanceOf(Request);
      expect(result.originalRequest).toBe(request);
    });

    it('should throw error for missing ID parameter', async () => {
      const request = new Request('http://localhost/api/advocates/123');
      
      await expect(validateAndSanitizeGetAdvocateById(request)).rejects.toThrow(InvalidParameterError);
    });

    it('should throw error for invalid ID format', async () => {
      const request = new Request('http://localhost/api/advocates/abc?id=abc');
      
      await expect(validateAndSanitizeGetAdvocateById(request)).rejects.toThrow(InvalidParameterError);
    });

    it('should throw error for non-positive ID', async () => {
      const request = new Request('http://localhost/api/advocates/0?id=0');
      
      await expect(validateAndSanitizeGetAdvocateById(request)).rejects.toThrow(InvalidParameterError);
    });
  });

  describe('validateAndSanitizeGetAdvocatesByCity', () => {
    it('should validate and sanitize valid requests', async () => {
      const request = new Request('http://localhost/api/advocates/city?city=  New York  ');
      
      const result = await validateAndSanitizeGetAdvocatesByCity(request);
      
      expect(result.data.city).toBe('New York');
      expect(result.request).toBeInstanceOf(Request);
      expect(result.originalRequest).toBe(request);
    });

    it('should throw error for missing city parameter', async () => {
      const request = new Request('http://localhost/api/advocates/city');
      
      await expect(validateAndSanitizeGetAdvocatesByCity(request)).rejects.toThrow(InvalidParameterError);
    });

    it('should throw error for empty city parameter', async () => {
      const request = new Request('http://localhost/api/advocates/city?city=');
      
      await expect(validateAndSanitizeGetAdvocatesByCity(request)).rejects.toThrow(InvalidParameterError);
    });

    it('should throw error for city with invalid characters', async () => {
      const request = new Request('http://localhost/api/advocates/city?city=New York!');
      
      await expect(validateAndSanitizeGetAdvocatesByCity(request)).rejects.toThrow(InvalidParameterError);
    });

    it('should sanitize XSS attempts in city name', async () => {
      const request = new Request('http://localhost/api/advocates/city?city=<script>alert(1)</script>');
      
      await expect(validateAndSanitizeGetAdvocatesByCity(request)).rejects.toThrow(InvalidParameterError);
    });
  });

  describe('DataProtectionMiddleware.createMiddleware', () => {
    it('should create a working middleware with custom schema', async () => {
      const { z } = await import('zod');
      
      const customSchema = z.object({
        name: z.string().min(1).max(50),
        age: z.coerce.number().int().positive().max(120)
      });
      
      const middleware = DataProtectionMiddleware.createMiddleware(customSchema, 'Custom validation error');
      
      const request = new Request('http://localhost/api/test?name=John&age=30');
      const result = await middleware(request);
      
      expect(result.data.name).toBe('John');
      expect(result.data.age).toBe(30);
      expect(result.request).toBeInstanceOf(Request);
      expect(result.originalRequest).toBe(request);
    });

    it('should throw error for invalid data in custom middleware', async () => {
      const { z } = await import('zod');
      
      const customSchema = z.object({
        name: z.string().min(1).max(50),
        age: z.coerce.number().int().positive().max(120)
      });
      
      const middleware = DataProtectionMiddleware.createMiddleware(customSchema, 'Custom validation error');
      
      const request = new Request('http://localhost/api/test?name=&age=150');
      
      await expect(middleware(request)).rejects.toThrow(InvalidParameterError);
    });
  });

  describe('DataProtectionMiddleware.sanitizeAndValidate', () => {
    it('should sanitize and validate input data', () => {
      const input = '  test@example.com  ';
      
      const sanitizer = (input: string) => input.trim();
      const validator = (input: string) => {
        if (!input.includes('@')) {
          throw new InvalidParameterError('email', 'Invalid email format');
        }
        return input;
      };
      
      const result = DataProtectionMiddleware.sanitizeAndValidate(input, sanitizer, validator);
      
      expect(result).toBe('test@example.com');
    });

    it('should throw error when validation fails after sanitization', () => {
      const input = '  invalid-email  ';
      
      const sanitizer = (input: string) => input.trim();
      const validator = (input: string) => {
        if (!input.includes('@')) {
          throw new InvalidParameterError('email', 'Invalid email format');
        }
        return input;
      };
      
      expect(() => DataProtectionMiddleware.sanitizeAndValidate(input, sanitizer, validator))
        .toThrow(InvalidParameterError);
    });
  });

  describe('Error Handling', () => {
    it('should preserve InvalidParameterError from validation', async () => {
      const request = new Request('http://localhost/api/advocates?page=0');
      
      try {
        await validateAndSanitizeGetAdvocates(request);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidParameterError);
        expect((error as InvalidParameterError).parameter).toBe('page');
      }
    });

    it('should wrap unknown errors in InvalidParameterError', async () => {
      // Test with a request that has no URL (edge case)
      const request = {} as Request;
      
      try {
        await validateAndSanitizeGetAdvocates(request);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidParameterError);
        expect((error as InvalidParameterError).parameter).toBe('request');
      }
    });
  });

  describe('Request Sanitization', () => {
    it('should create a new request with sanitized parameters', async () => {
      const request = new Request('http://localhost/api/advocates?search=  doctor  &city=  New York  ');
      
      console.log('DEBUG: Original request URL:', request.url);
      console.log('DEBUG: Original search param:', new URL(request.url).searchParams.get('search'));
      console.log('DEBUG: Original city param:', new URL(request.url).searchParams.get('city'));
      
      const result = await validateAndSanitizeGetAdvocates(request);
      
      // The sanitized request should have cleaned parameters
      const sanitizedUrl = new URL(result.request.url);
      console.log('DEBUG: Sanitized request URL:', result.request.url);
      console.log('DEBUG: Sanitized search param:', sanitizedUrl.searchParams.get('search'));
      console.log('DEBUG: Sanitized city param:', sanitizedUrl.searchParams.get('city'));
      
      expect(sanitizedUrl.searchParams.get('search')).toBe('doctor');
      expect(sanitizedUrl.searchParams.get('city')).toBe('New York');
      
      // Original request should remain unchanged
      const originalUrl = new URL(result.originalRequest.url);
      console.log('DEBUG: Original URL after processing:', originalUrl.toString());
      console.log('DEBUG: Original search param after processing:', originalUrl.searchParams.get('search'));
      console.log('DEBUG: Original city param after processing:', originalUrl.searchParams.get('city'));
      console.log('DEBUG: Expected city param:', '  New York  ');
      
      expect(originalUrl.searchParams.get('search')).toBe('  doctor  ');
      expect(originalUrl.searchParams.get('city')).toBe('  New York');
    });

    it('should handle requests with no search parameters', async () => {
      const request = new Request('http://localhost/api/advocates');
      
      const result = await validateAndSanitizeGetAdvocates(request);
      
      expect(result.request).toBeInstanceOf(Request);
      expect(result.originalRequest).toBe(request);
      
      const sanitizedUrl = new URL(result.request.url);
      expect(sanitizedUrl.search).toBe('');
    });
  });
}); 
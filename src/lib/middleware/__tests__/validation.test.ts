import { 
  PaginationSchema, 
  SearchSchema, 
  CitySchema, 
  DegreeSchema,
  ExperienceSchema, 
  SortSchema, 
  IdSchema,
  GetAdvocatesSchema,
  GetAdvocateByIdSchema,
  GetAdvocatesByCitySchema,
  validateGetAdvocates,
  validateGetAdvocateById,
  validateGetAdvocatesByCity,
  createValidationMiddleware
} from '../validation';
import { InvalidParameterError } from '../../errors/AppError';

describe('Validation Middleware', () => {
  describe('PaginationSchema', () => {
    it('should validate valid pagination parameters', () => {
      const validParams = { page: '1', limit: '20' };
      const result = PaginationSchema.safeParse(validParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ page: 1, limit: 20 });
      }
    });

    it('should use default values when parameters are missing', () => {
      const result = PaginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ page: 1, limit: 20 });
      }
    });

    it('should reject invalid page numbers', () => {
      const invalidParams = { page: '0', limit: '20' };
      const result = PaginationSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    it('should reject invalid limit values', () => {
      const invalidParams = { page: '1', limit: '101' };
      const result = PaginationSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchSchema', () => {
    it('should validate valid search terms', () => {
      const validParams = { search: 'doctor' };
      const result = SearchSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should handle empty search terms', () => {
      const result = SearchSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject search terms that are too long', () => {
      const longSearch = 'a'.repeat(101);
      const result = SearchSchema.safeParse({ search: longSearch });
      expect(result.success).toBe(false);
    });
  });

  describe('CitySchema', () => {
    it('should validate valid city names', () => {
      const validCities = ['New York', 'Los Angeles', 'San Francisco', 'St. Louis'];
      
      validCities.forEach(city => {
        const result = CitySchema.safeParse({ city });
        expect(result.success).toBe(true);
      });
    });

    it('should reject city names with invalid characters', () => {
      const invalidCities = ['New York!', 'Los Angeles@', 'San Francisco#', 'St. Louis$'];
      
      invalidCities.forEach(city => {
        const result = CitySchema.safeParse({ city });
        expect(result.success).toBe(false);
      });
    });

    it('should reject empty city names', () => {
      const result = CitySchema.safeParse({ city: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('DegreeSchema', () => {
    it('should validate valid degree names', () => {
      const validDegrees = ['MD', 'PhD', 'RN', 'NP'];
      
      validDegrees.forEach(degree => {
        const result = DegreeSchema.safeParse({ degree });
        expect(result.success).toBe(true);
      });
    });

    it('should handle missing degree parameter', () => {
      const result = DegreeSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('ExperienceSchema', () => {
    it('should validate valid experience ranges', () => {
      const validRanges = [
        { minExperience: '5', maxExperience: '10' },
        { minExperience: '0', maxExperience: '20' },
        { minExperience: '10' },
        { maxExperience: '15' }
      ];
      
      validRanges.forEach(range => {
        const result = ExperienceSchema.safeParse(range);
        expect(result.success).toBe(true);
      });
    });

    it('should reject when min experience is greater than max experience', () => {
      const invalidRange = { minExperience: '15', maxExperience: '10' };
      const result = ExperienceSchema.safeParse(invalidRange);
      console.log('Experience validation result:', result);
      expect(result.success).toBe(false);
    });

    it('should reject negative experience values', () => {
      const invalidRange = { minExperience: '-5', maxExperience: '10' };
      const result = ExperienceSchema.safeParse(invalidRange);
      expect(result.success).toBe(false);
    });
  });

  describe('SortSchema', () => {
    it('should validate valid sort parameters', () => {
      const validSorts = [
        { sortBy: 'firstName', sortOrder: 'asc' },
        { sortBy: 'lastName', sortOrder: 'desc' },
        { sortBy: 'city', sortOrder: 'asc' },
        { sortBy: 'degree', sortOrder: 'desc' },
        { sortBy: 'experience', sortOrder: 'asc' }
      ];
      
      validSorts.forEach(sort => {
        const result = SortSchema.safeParse(sort);
        expect(result.success).toBe(true);
      });
    });

    it('should use default values when sort parameters are missing', () => {
      const result = SortSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ sortBy: 'lastName', sortOrder: 'asc' });
      }
    });

    it('should reject invalid sort fields', () => {
      const result = SortSchema.safeParse({ sortBy: 'invalid', sortOrder: 'asc' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid sort orders', () => {
      const result = SortSchema.safeParse({ sortBy: 'firstName', sortOrder: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('IdSchema', () => {
    it('should validate valid IDs', () => {
      const validIds = ['1', '123', '999999'];
      
      validIds.forEach(id => {
        const result = IdSchema.safeParse({ id });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe(Number(id));
        }
      });
    });

    it('should reject invalid ID formats', () => {
      const invalidIds = ['0', '-1', 'abc', '1.5'];
      
      invalidIds.forEach(id => {
        const result = IdSchema.safeParse({ id });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('GetAdvocatesSchema', () => {
    it('should validate complete advocate search parameters', () => {
      const validParams = {
        page: '1',
        limit: '20',
        search: 'doctor',
        city: 'New York',
        degree: 'MD',
        minExperience: '5',
        maxExperience: '15',
        sortBy: 'lastName',
        sortOrder: 'asc'
      };
      
      const result = GetAdvocatesSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should validate minimal advocate search parameters', () => {
      const result = GetAdvocatesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          page: 1,
          limit: 20,
          sortBy: 'lastName',
          sortOrder: 'asc'
        });
      }
    });

    it('should reject invalid experience ranges in combined schema', () => {
      const invalidParams = {
        minExperience: '15',
        maxExperience: '10'
      };
      const result = GetAdvocatesSchema.safeParse(invalidParams);
      console.log('Combined schema validation result:', result);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation Middleware Functions', () => {
    describe('validateGetAdvocates', () => {
      it('should validate and return data for valid requests', () => {
        const request = new Request('http://localhost/api/advocates?page=1&limit=20&search=doctor');
        const result = validateGetAdvocates(request);
        
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.search).toBe('doctor');
      });

      it('should throw InvalidParameterError for invalid requests', () => {
        const request = new Request('http://localhost/api/advocates?page=0&limit=101');
        
        expect(() => validateGetAdvocates(request)).toThrow(InvalidParameterError);
      });
    });

    describe('validateGetAdvocateById', () => {
      it('should validate and return data for valid requests', () => {
        const request = new Request('http://localhost/api/advocates/123?id=123');
        const result = validateGetAdvocateById(request);
        
        expect(result.id).toBe(123);
      });

      it('should throw InvalidParameterError for invalid requests', () => {
        const request = new Request('http://localhost/api/advocates/abc?id=abc');
        
        expect(() => validateGetAdvocateById(request)).toThrow(InvalidParameterError);
      });
    });

    describe('validateGetAdvocatesByCity', () => {
      it('should validate and return data for valid requests', () => {
        const request = new Request('http://localhost/api/advocates/city?city=New York');
        const result = validateGetAdvocatesByCity(request);
        
        expect(result.city).toBe('New York');
      });

      it('should throw InvalidParameterError for invalid requests', () => {
        const request = new Request('http://localhost/api/advocates/city?city=');
        
        expect(() => validateGetAdvocatesByCity(request)).toThrow(InvalidParameterError);
      });
    });

    describe('createValidationMiddleware', () => {
      it('should create a working validation middleware', () => {
        const customSchema = PaginationSchema;
        const middleware = createValidationMiddleware(customSchema, 'Custom error message');
        
        const request = new Request('http://localhost/api/test?page=1&limit=20');
        const result = middleware(request);
        
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });

      it('should throw error with custom message for invalid requests', () => {
        const customSchema = PaginationSchema;
        const middleware = createValidationMiddleware(customSchema, 'Custom error message');
        
        const request = new Request('http://localhost/api/test?page=0');
        
        expect(() => middleware(request)).toThrow(InvalidParameterError);
      });
    });
  });
}); 
import { z } from 'zod';
import { InvalidParameterError } from '../errors/AppError';

// Base validation schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().min(1).max(1000).optional().default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).optional().default(20),
});

export const SearchSchema = z.object({
  search: z.string().trim().max(100).optional().transform(val => val === '' ? undefined : val),
});

export const CitySchema = z.object({
  city: z.string().trim().min(1).max(100).regex(/^[a-zA-Z\s\-'\.]+$/, 'City name contains invalid characters'),
});

export const OptionalCitySchema = z.object({
  city: z.string().trim().max(100).optional().transform(val => val === '' ? undefined : val),
});

export const DegreeSchema = z.object({
  degree: z.string().trim().max(100).optional().transform(val => val === '' ? undefined : val),
});

export const ExperienceSchema = z.object({
  minExperience: z.coerce.number().int().nonnegative().min(0).max(50).optional(),
  maxExperience: z.coerce.number().int().nonnegative().min(0).max(50).optional(),
}).refine(
  (data) => {
    if (data.minExperience !== undefined && data.maxExperience !== undefined) {
      return data.minExperience <= data.maxExperience;
    }
    return true;
  },
  {
    message: "Minimum experience cannot be greater than maximum experience",
    path: ["minExperience"],
  }
);

export const SortSchema = z.object({
  sortBy: z.enum(['firstName', 'lastName', 'city', 'degree', 'experience']).optional().default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const IdSchema = z.object({
  id: z.coerce.number().int().positive().min(1),
});

// Combined schemas for different endpoints
export const GetAdvocatesSchema = PaginationSchema
  .merge(SearchSchema)
  .merge(OptionalCitySchema)
  .merge(DegreeSchema)
  .merge(ExperienceSchema)
  .merge(SortSchema)
  .refine(
    (data) => {
      if (data.minExperience !== undefined && data.maxExperience !== undefined) {
        return data.minExperience <= data.maxExperience;
      }
      return true;
    },
    {
      message: "Minimum experience cannot be greater than maximum experience",
      path: ["minExperience"],
    }
  );

export const GetAdvocateByIdSchema = IdSchema;

export const GetAdvocatesByCitySchema = CitySchema;

// Validation middleware factory
export function createValidationMiddleware<T extends z.ZodSchema>(
  schema: T,
  errorMessage: string = 'Invalid request parameters'
) {
  return function validateRequest(request: Request): z.infer<T> {
    try {
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams.entries());
      
      const result = schema.safeParse(params);
      
      if (!result.success) {
        const errors = result.error.issues;
        const firstError = errors[0];
        
        if (!firstError) {
          throw new InvalidParameterError('request', errorMessage);
        }
        
        throw new InvalidParameterError(
          firstError.path.join('.'),
          firstError.message || errorMessage
        );
      }
      
      return result.data;
    } catch (error) {
      if (error instanceof InvalidParameterError) {
        throw error;
      }
      throw new InvalidParameterError('request', 'Failed to parse request parameters');
    }
  };
}

// Type-safe validation functions
export const validateGetAdvocates = createValidationMiddleware(
  GetAdvocatesSchema,
  'Invalid advocate search parameters'
);

export const validateGetAdvocateById = createValidationMiddleware(
  GetAdvocateByIdSchema,
  'Invalid advocate ID'
);

export const validateGetAdvocatesByCity = createValidationMiddleware(
  GetAdvocatesByCitySchema,
  'Invalid city parameter'
);

// Utility function to extract and validate specific parameters
export function extractAndValidate<T extends z.ZodSchema>(
  request: Request,
  schema: T,
  errorMessage?: string
): z.infer<T> {
  return createValidationMiddleware(schema, errorMessage)(request);
} 
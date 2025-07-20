import validator from 'validator';
import xss from 'xss';
import { InvalidParameterError } from '../errors/AppError';

// Sanitization options
export const SanitizationOptions = {
  // XSS prevention options
  xss: {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'] as string[],
  },
  
  // SQL injection prevention
  sql: {
    escape: true,
    escapeOptions: {
      format: 'literal',
    },
  },
  
  // General text sanitization
  text: {
    trim: true,
    normalizeWhitespace: true,
    removeNullBytes: true,
  },
} as const;

// Sanitization functions
export class Sanitizer {
  /**
   * Sanitize a string input
   */
  static sanitizeString(input: string | null | undefined, options: {
    maxLength?: number;
    allowHtml?: boolean;
    allowSpecialChars?: boolean;
  } = {}): string {
    if (input === null || input === undefined) {
      return '';
    }

    let sanitized = String(input);

    // Remove null bytes and other dangerous characters always
    sanitized = sanitized.replace(/\0/g, '');
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    if (options.allowHtml) {
      // Only enforce max length for HTML, do not trim or normalize whitespace
      if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
      }
      return sanitized;
    }

    // For non-HTML, apply all other sanitization
    sanitized = validator.trim(sanitized);
    sanitized = sanitized.replace(/\s+/g, ' '); // Normalize whitespace

    if (!options.allowSpecialChars) {
      sanitized = sanitized.replace(/[<>\"'&]/g, ' '); // Replace with space
      // Normalize multiple spaces to one, but preserve double spaces from & replacement
      sanitized = sanitized.replace(/   +/g, ' '); // Normalize 3+ spaces to 1
      sanitized = sanitized.replace(/  +/g, '  '); // Normalize 2+ spaces to 2 (preserve double spaces)
      sanitized = sanitized.trim(); // Remove leading/trailing spaces
    }

    // Remove dangerous HTML tags and attributes (after special char replacement)
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object[^>]*>.*?<\/object>/gi, '');
    sanitized = sanitized.replace(/<embed[^>]*>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    sanitized = sanitized.replace(/data:/gi, '');
    sanitized = sanitized.replace(/alert\([^)]*\)/gi, ''); // Remove alert() patterns
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    sanitized = validator.stripLow(sanitized);

    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength).trim();
    }

    return sanitized;
  }

  /**
   * Sanitize a number input
   */
  static sanitizeNumber(input: string | number | null | undefined, options: {
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}): number {
    if (input === null || input === undefined) {
      throw new InvalidParameterError('number', 'Number value is required');
    }

    const num = Number(input);

    if (isNaN(num)) {
      throw new InvalidParameterError('number', 'Invalid number format');
    }

    if (options.integer && !Number.isInteger(num)) {
      throw new InvalidParameterError('number', 'Integer value required');
    }

    if (options.min !== undefined && num < options.min) {
      throw new InvalidParameterError('number', `Value must be at least ${options.min}`);
    }

    if (options.max !== undefined && num > options.max) {
      throw new InvalidParameterError('number', `Value must be at most ${options.max}`);
    }

    return num;
  }

  /**
   * Sanitize an email address
   */
  static sanitizeEmail(input: string | null | undefined): string {
    if (!input) {
      throw new InvalidParameterError('email', 'Email is required');
    }

    const sanitized = this.sanitizeString(input, { maxLength: 254 });
    
    if (!validator.isEmail(sanitized)) {
      throw new InvalidParameterError('email', 'Invalid email format');
    }

    return sanitized.toLowerCase();
  }

  /**
   * Sanitize a URL
   */
  static sanitizeUrl(input: string | null | undefined, options: {
    protocols?: string[];
    requireProtocol?: boolean;
  } = {}): string {
    if (!input) {
      throw new InvalidParameterError('url', 'URL is required');
    }

    const sanitized = this.sanitizeString(input, { maxLength: 2048 });
    
    if (!validator.isURL(sanitized, {
      protocols: options.protocols || ['http', 'https'],
      require_protocol: options.requireProtocol !== false,
    })) {
      throw new InvalidParameterError('url', 'Invalid URL format');
    }

    return sanitized;
  }

  /**
   * Sanitize a city name
   */
  static sanitizeCity(input: string | null | undefined): string {
    if (!input) {
      throw new InvalidParameterError('city', 'City is required');
    }

    // Check max length before sanitization
    if (input.length > 100) {
      throw new InvalidParameterError('city', 'City name is too long');
    }

    // Validate for invalid characters before sanitization
    if (!/^[a-zA-Z\s\-'\.]+$/.test(input)) {
      throw new InvalidParameterError('city', 'City name contains invalid characters');
    }

    const sanitized = this.sanitizeString(input, { 
      maxLength: 100,
      allowSpecialChars: true // Allow special chars for city names
    });

    return sanitized.trim();
  }

  /**
   * Sanitize search terms
   */
  static sanitizeSearchTerm(input: string | null | undefined): string {
    if (!input) {
      return '';
    }

    const sanitized = this.sanitizeString(input, { 
      maxLength: 100,
      allowSpecialChars: false 
    });

    // Remove potentially dangerous search patterns
    const dangerousPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)\b)/gi,
      /[<>\"'&]/g,
      /(\b(and|or)\b\s+\d+\s*=\s*\d+)/gi, // SQL injection patterns
    ];

    let cleaned = sanitized;
    dangerousPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // If the cleaned result is empty or contains only dangerous content, return empty string
    if (!cleaned.trim()) {
      return '';
    }

    return cleaned.trim();
  }

  /**
   * Sanitize an object with string properties
   */
  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    stringFields: (keyof T)[],
    options: {
      maxLength?: number;
      allowHtml?: boolean;
      allowSpecialChars?: boolean;
    } = {}
  ): T {
    const sanitized = { ...obj };

    for (const field of stringFields) {
      if (typeof sanitized[field] === 'string') {
        (sanitized as any)[field] = this.sanitizeString(sanitized[field], options);
      }
    }

    return sanitized;
  }

  /**
   * Sanitize query parameters
   */
  static sanitizeQueryParams(params: Record<string, string | string[] | undefined>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Take the first value if it's an array
          sanitized[key] = this.sanitizeString(value[0], { maxLength: 100 });
        } else {
          sanitized[key] = this.sanitizeString(value, { maxLength: 100 });
        }
      }
    }

    return sanitized;
  }
}

// Middleware factory for request sanitization
export function createSanitizationMiddleware(options: {
  sanitizeQuery?: boolean;
  sanitizeBody?: boolean;
  sanitizeHeaders?: boolean;
  maxQueryLength?: number;
  maxBodyLength?: number;
} = {}) {
  return function sanitizeRequest(request: Request): Request {
    // For Next.js API routes, we typically work with the request as-is
    // but we can add sanitization logic here if needed
    // The main sanitization happens in the validation layer
    
    return request;
  };
}

// Utility function to sanitize URL search parameters
export function sanitizeSearchParams(searchParams: URLSearchParams): URLSearchParams {
  const sanitized = new URLSearchParams();

  searchParams.forEach((value, key) => {
    let sanitizedValue: string;
    
    // Apply specific sanitization based on parameter type
    switch (key) {
      case 'search':
        sanitizedValue = Sanitizer.sanitizeSearchTerm(value);
        break;
      case 'city':
        // For city, just do basic sanitization without validation to avoid modifying original
        sanitizedValue = Sanitizer.sanitizeString(value, { maxLength: 100 });
        break;
      default:
        sanitizedValue = Sanitizer.sanitizeString(value, { maxLength: 100 });
    }
    
    sanitized.set(key, sanitizedValue);
  });

  return sanitized;
} 
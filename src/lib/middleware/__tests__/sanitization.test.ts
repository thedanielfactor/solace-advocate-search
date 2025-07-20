import { Sanitizer, sanitizeSearchParams } from '../sanitization';
import { InvalidParameterError } from '../../errors/AppError';

describe('Sanitization Middleware', () => {
  describe('Sanitizer.sanitizeString', () => {
    it('should sanitize basic strings', () => {
      const input = '  Hello World  ';
      const result = Sanitizer.sanitizeString(input);
      expect(result).toBe('Hello World');
    });

    it('should handle null and undefined inputs', () => {
      expect(Sanitizer.sanitizeString(null)).toBe('');
      expect(Sanitizer.sanitizeString(undefined)).toBe('');
    });

    it('should remove null bytes and control characters', () => {
      const input = 'Hello\x00World\x01\x02\x03';
      const result = Sanitizer.sanitizeString(input);
      expect(result).toBe('HelloWorld');
    });

    it('should prevent XSS attacks', () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<object data="javascript:alert(1)"></object>'
      ];

      xssInputs.forEach(input => {
        const result = Sanitizer.sanitizeString(input);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('onerror=');
        expect(result).not.toContain('<iframe>');
        expect(result).not.toContain('<object>');
      });
    });

    it('should respect maxLength option', () => {
      const input = 'This is a very long string that should be truncated';
      const result = Sanitizer.sanitizeString(input, { maxLength: 20 });
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toBe('This is a very long');
    });

    it('should allow HTML when allowHtml is true', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = Sanitizer.sanitizeString(input, { allowHtml: true });
      expect(result).toBe(input);
    });

    it('should remove special characters when allowSpecialChars is false', () => {
      const input = 'Hello <World> & "Universe"';
      console.log('DEBUG: Input string:', JSON.stringify(input));
      console.log('DEBUG: Input length:', input.length);
      console.log('DEBUG: Input characters:', Array.from(input).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
      
      const result = Sanitizer.sanitizeString(input, { allowSpecialChars: false });
      console.log('DEBUG: Result string:', JSON.stringify(result));
      console.log('DEBUG: Result length:', result.length);
      console.log('DEBUG: Result characters:', Array.from(result).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
      console.log('DEBUG: Expected:', JSON.stringify('Hello  World Universe'));
      
      expect(result).toBe('Hello  World Universe');
    });

    it('should normalize whitespace', () => {
      const input = 'Hello    World\n\nTest';
      const result = Sanitizer.sanitizeString(input);
      expect(result).toBe('Hello World Test');
    });
  });

  describe('Sanitizer.sanitizeNumber', () => {
    it('should sanitize valid numbers', () => {
      expect(Sanitizer.sanitizeNumber('123')).toBe(123);
      expect(Sanitizer.sanitizeNumber(456)).toBe(456);
    });

    it('should throw error for null/undefined inputs', () => {
      expect(() => Sanitizer.sanitizeNumber(null)).toThrow(InvalidParameterError);
      expect(() => Sanitizer.sanitizeNumber(undefined)).toThrow(InvalidParameterError);
    });

    it('should throw error for invalid number formats', () => {
      expect(() => Sanitizer.sanitizeNumber('abc')).toThrow(InvalidParameterError);
      expect(() => Sanitizer.sanitizeNumber('12.34.56')).toThrow(InvalidParameterError);
    });

    it('should enforce integer constraint', () => {
      expect(() => Sanitizer.sanitizeNumber('12.5', { integer: true })).toThrow(InvalidParameterError);
      expect(Sanitizer.sanitizeNumber('12', { integer: true })).toBe(12);
    });

    it('should enforce min/max constraints', () => {
      expect(() => Sanitizer.sanitizeNumber('5', { min: 10 })).toThrow(InvalidParameterError);
      expect(() => Sanitizer.sanitizeNumber('15', { max: 10 })).toThrow(InvalidParameterError);
      expect(Sanitizer.sanitizeNumber('15', { min: 10, max: 20 })).toBe(15);
    });
  });

  describe('Sanitizer.sanitizeEmail', () => {
    it('should sanitize valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        const result = Sanitizer.sanitizeEmail(email);
        expect(result).toBe(email.toLowerCase());
      });
    });

    it('should throw error for invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(() => Sanitizer.sanitizeEmail(email)).toThrow(InvalidParameterError);
      });
    });

    it('should throw error for null/undefined inputs', () => {
      expect(() => Sanitizer.sanitizeEmail(null)).toThrow(InvalidParameterError);
      expect(() => Sanitizer.sanitizeEmail(undefined)).toThrow(InvalidParameterError);
    });

    it('should enforce max length', () => {
      const longEmail = 'a'.repeat(255) + '@example.com';
      expect(() => Sanitizer.sanitizeEmail(longEmail)).toThrow(InvalidParameterError);
    });
  });

  describe('Sanitizer.sanitizeUrl', () => {
    it('should sanitize valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://www.example.org/path',
        'https://subdomain.example.co.uk/path?param=value'
      ];

      validUrls.forEach(url => {
        const result = Sanitizer.sanitizeUrl(url);
        expect(result).toBe(url);
      });
    });

    it('should throw error for invalid URL formats', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        ''
      ];

      invalidUrls.forEach(url => {
        expect(() => Sanitizer.sanitizeUrl(url)).toThrow(InvalidParameterError);
      });
    });

    it('should allow custom protocols', () => {
      const result = Sanitizer.sanitizeUrl('ftp://example.com', { protocols: ['ftp'] });
      expect(result).toBe('ftp://example.com');
    });

    it('should enforce protocol requirement', () => {
      expect(() => Sanitizer.sanitizeUrl('example.com', { requireProtocol: true })).toThrow(InvalidParameterError);
    });
  });

  describe('Sanitizer.sanitizeCity', () => {
    it('should sanitize valid city names', () => {
      const validCities = [
        'New York',
        'Los Angeles',
        'San Francisco',
        'St. Louis',
        'O\'Fallon',
        'Saint Louis'
      ];

      validCities.forEach(city => {
        const result = Sanitizer.sanitizeCity(city);
        expect(result).toBe(city.trim());
      });
    });

    it('should throw error for city names with invalid characters', () => {
      const invalidCities = [
        'New York!',
        'Los Angeles@',
        'San Francisco#',
        'St. Louis$',
        'City with <script>',
        ''
      ];

      invalidCities.forEach(city => {
        expect(() => Sanitizer.sanitizeCity(city)).toThrow(InvalidParameterError);
      });
    });

    it('should throw error for null/undefined inputs', () => {
      expect(() => Sanitizer.sanitizeCity(null)).toThrow(InvalidParameterError);
      expect(() => Sanitizer.sanitizeCity(undefined)).toThrow(InvalidParameterError);
    });

    it('should enforce max length', () => {
      const longCity = 'A'.repeat(101);
      expect(() => Sanitizer.sanitizeCity(longCity)).toThrow(InvalidParameterError);
    });
  });

  describe('Sanitizer.sanitizeSearchTerm', () => {
    it('should sanitize valid search terms', () => {
      const validTerms = [
        'doctor',
        'cardiologist',
        'Dr. Smith',
        'health care'
      ];

      validTerms.forEach(term => {
        const result = Sanitizer.sanitizeSearchTerm(term);
        expect(result).toBe(term.trim());
      });
    });

    it('should remove SQL injection patterns', () => {
      const sqlInjectionTerms = [
        'doctor UNION SELECT * FROM users',
        'cardiologist AND 1=1',
        'doctor OR 1=1',
        'doctor; DROP TABLE users;'
      ];

      sqlInjectionTerms.forEach(term => {
        const result = Sanitizer.sanitizeSearchTerm(term);
        expect(result).not.toContain('UNION');
        expect(result).not.toContain('SELECT');
        expect(result).not.toContain('AND 1=1');
        expect(result).not.toContain('OR 1=1');
        expect(result).not.toContain('DROP');
      });
    });

    it('should remove XSS patterns', () => {
      const xssTerms = [
        'doctor<script>alert(1)</script>',
        'cardiologist<img src=x onerror=alert(1)>',
        'doctorjavascript:alert(1)'
      ];

      xssTerms.forEach(term => {
        const result = Sanitizer.sanitizeSearchTerm(term);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('onerror=');
      });
    });

    it('should handle empty inputs', () => {
      expect(Sanitizer.sanitizeSearchTerm('')).toBe('');
      expect(Sanitizer.sanitizeSearchTerm(null)).toBe('');
      expect(Sanitizer.sanitizeSearchTerm(undefined)).toBe('');
    });

    it('should enforce max length', () => {
      const longTerm = 'a'.repeat(101);
      const result = Sanitizer.sanitizeSearchTerm(longTerm);
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Sanitizer.sanitizeObject', () => {
    it('should sanitize object string properties', () => {
      const obj = {
        name: '  John Doe  ',
        email: '  test@example.com  ',
        age: 30,
        city: '  New York  '
      };

      const result = Sanitizer.sanitizeObject(obj, ['name', 'email', 'city']);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('test@example.com');
      expect(result.age).toBe(30); // Should remain unchanged
      expect(result.city).toBe('New York');
    });

    it('should apply sanitization options', () => {
      const obj = {
        name: 'John <Doe>',
        description: 'Some <script>alert(1)</script> description'
      };

      console.log('DEBUG: Object name input:', JSON.stringify(obj.name));
      console.log('DEBUG: Object name input length:', obj.name.length);
      console.log('DEBUG: Object name input characters:', Array.from(obj.name).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));

      const result = Sanitizer.sanitizeObject(obj, ['name', 'description'], { allowSpecialChars: false });
      
      console.log('DEBUG: Object name result:', JSON.stringify(result.name));
      console.log('DEBUG: Object name result length:', result.name.length);
      console.log('DEBUG: Object name result characters:', Array.from(result.name).map(c => `${c}(${c.charCodeAt(0)})`).join(' '));
      console.log('DEBUG: Expected name:', JSON.stringify('John  Doe'));
      
      expect(result.name).toBe('John  Doe');
      expect(result.description).not.toContain('<script>');
    });
  });

  describe('Sanitizer.sanitizeQueryParams', () => {
    it('should sanitize query parameters', () => {
      const params = {
        search: '  doctor  ',
        city: '  New York  ',
        page: '1',
        limit: '20'
      };

      const result = Sanitizer.sanitizeQueryParams(params);
      
      expect(result.search).toBe('doctor');
      expect(result.city).toBe('New York');
      expect(result.page).toBe('1');
      expect(result.limit).toBe('20');
    });

    it('should handle array parameters', () => {
      const params = {
        tags: ['tag1', '  tag2  ', 'tag3'],
        search: 'doctor'
      };

      const result = Sanitizer.sanitizeQueryParams(params);
      
      expect(result.tags).toBe('tag1'); // Takes first value
      expect(result.search).toBe('doctor');
    });

    it('should handle null/undefined values', () => {
      const params = {
        search: 'doctor',
        city: undefined,
        page: undefined
      };

      const result = Sanitizer.sanitizeQueryParams(params);
      
      expect(result.search).toBe('doctor');
      expect(result.city).toBeUndefined();
      expect(result.page).toBeUndefined();
    });
  });

  describe('sanitizeSearchParams', () => {
    it('should sanitize URLSearchParams', () => {
      const searchParams = new URLSearchParams();
      searchParams.set('search', '  doctor  ');
      searchParams.set('city', '  New York  ');
      searchParams.set('page', '1');

      const result = sanitizeSearchParams(searchParams);
      
      expect(result.get('search')).toBe('doctor');
      expect(result.get('city')).toBe('New York');
      expect(result.get('page')).toBe('1');
    });

    it('should handle empty search params', () => {
      const searchParams = new URLSearchParams();
      const result = sanitizeSearchParams(searchParams);
      
      expect(result.toString()).toBe('');
    });
  });
}); 
import { AdvocateController } from '../AdvocateController';
import { AdvocateService } from '../../services/AdvocateService';
import { 
  ValidationError, 
  ResourceNotFoundError, 
  InvalidParameterError,
  DatabaseError 
} from '../../errors/AppError';
import type { ApiResponse } from '@/types';

// Mock the service
jest.mock('../../services/AdvocateService');
const mockAdvocateService = AdvocateService as jest.Mocked<typeof AdvocateService>;

describe('AdvocateController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdvocates', () => {
    const mockAdvocates = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        degree: 'MD',
        specialties: ['Cardiology'],
        yearsOfExperience: 10,
        phoneNumber: 1234567890,
        createdAt: new Date()
      }
    ];

    const mockResult = {
      data: mockAdvocates,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };

    it('should return advocates with valid parameters', async () => {
      mockAdvocateService.getAdvocates.mockResolvedValue(mockResult);

      const request = new Request('http://localhost:3000/api/advocates?page=1&limit=20&search=test&city=New%20York&degree=MD&minExperience=5&maxExperience=15&sortBy=lastName&sortOrder=asc');

      const response = await AdvocateController.getAdvocates(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockAdvocates.map(advocate => ({
        ...advocate,
        createdAt: advocate.createdAt.toISOString()
      })));
      expect(responseData.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });

      expect(mockAdvocateService.getAdvocates).toHaveBeenCalledWith(
        {
          search: 'test',
          city: 'New York',
          degree: 'MD',
          minExperience: 5,
          maxExperience: 15
        },
        {
          sortBy: 'lastName',
          sortOrder: 'asc'
        },
        {
          page: 1,
          limit: 20
        }
      );
    });

    it('should handle missing parameters with defaults', async () => {
      mockAdvocateService.getAdvocates.mockResolvedValue(mockResult);

      const request = new Request('http://localhost:3000/api/advocates');

      const response = await AdvocateController.getAdvocates(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockAdvocateService.getAdvocates).toHaveBeenCalledWith(
        {
          search: undefined,
          city: undefined,
          degree: undefined,
          minExperience: undefined,
          maxExperience: undefined
        },
        {
          sortBy: 'lastName',
          sortOrder: 'asc'
        },
        {
          page: 1,
          limit: 20
        }
      );
    });

    it('should handle validation errors', async () => {
      const validationError = new ValidationError('Invalid experience range', 'experienceRange');
      mockAdvocateService.getAdvocates.mockRejectedValue(validationError);

      const request = new Request('http://localhost:3000/api/advocates?minExperience=15&maxExperience=5');

      const response = await AdvocateController.getAdvocates(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('ValidationError');
      expect(responseData.message).toBe('Invalid experience range');
      expect(responseData.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      const databaseError = new DatabaseError('Database connection failed');
      mockAdvocateService.getAdvocates.mockRejectedValue(databaseError);

      const request = new Request('http://localhost:3000/api/advocates');

      const response = await AdvocateController.getAdvocates(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('DatabaseError');
      expect(responseData.message).toBe('Database connection failed');
      expect(responseData.code).toBe('DATABASE_ERROR');
    });

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Unknown error occurred');
      mockAdvocateService.getAdvocates.mockRejectedValue(unknownError);

      const request = new Request('http://localhost:3000/api/advocates');

      const response = await AdvocateController.getAdvocates(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('DatabaseError');
      expect(responseData.message).toBe('Unknown error occurred');
    });

    it('should handle invalid page parameter', async () => {
      const request = new Request('http://localhost:3000/api/advocates?page=0');

      const response = await AdvocateController.getAdvocates(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('InvalidParameterError');
    });

    it('should handle invalid limit parameter', async () => {
      const request = new Request('http://localhost:3000/api/advocates?limit=101');

      const response = await AdvocateController.getAdvocates(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('InvalidParameterError');
    });
  });

  describe('getAdvocateById', () => {
    const mockAdvocate = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      city: 'New York',
      degree: 'MD',
      specialties: ['Cardiology'],
      yearsOfExperience: 10,
      phoneNumber: 1234567890,
      createdAt: new Date()
    };

    it('should return advocate when found', async () => {
      mockAdvocateService.getAdvocateById.mockResolvedValue(mockAdvocate);

      const request = new Request('http://localhost:3000/api/advocates/1?id=1');

      const response = await AdvocateController.getAdvocateById(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual({
        ...mockAdvocate,
        createdAt: mockAdvocate.createdAt.toISOString()
      });
      expect(mockAdvocateService.getAdvocateById).toHaveBeenCalledWith(1);
    });

    it('should handle missing id parameter', async () => {
      const request = new Request('http://localhost:3000/api/advocates/1');

      const response = await AdvocateController.getAdvocateById(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('InvalidParameterError');
      expect(responseData.message).toBe('Advocate ID is required');
      expect(responseData.parameter).toBe('id');
    });

    it('should handle invalid id format', async () => {
      const request = new Request('http://localhost:3000/api/advocates/1?id=invalid');

      const response = await AdvocateController.getAdvocateById(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('InvalidParameterError');
      expect(responseData.message).toBe('Invalid advocate ID format');
      expect(responseData.parameter).toBe('id');
    });

    it('should handle advocate not found', async () => {
      const notFoundError = new ResourceNotFoundError('Advocate', 999);
      mockAdvocateService.getAdvocateById.mockRejectedValue(notFoundError);

      const request = new Request('http://localhost:3000/api/advocates/1?id=999');

      const response = await AdvocateController.getAdvocateById(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('ResourceNotFoundError');
      expect(responseData.message).toBe('Advocate with identifier \'999\' not found');
    });

    it('should handle validation errors', async () => {
      const validationError = new ValidationError('Invalid advocate ID', 'id', 0);
      mockAdvocateService.getAdvocateById.mockRejectedValue(validationError);

      const request = new Request('http://localhost:3000/api/advocates/1?id=0');

      const response = await AdvocateController.getAdvocateById(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('ValidationError');
      expect(responseData.message).toBe('Invalid advocate ID');
    });

    it('should handle database errors', async () => {
      const databaseError = new DatabaseError('Database connection failed');
      mockAdvocateService.getAdvocateById.mockRejectedValue(databaseError);

      const request = new Request('http://localhost:3000/api/advocates/1?id=1');

      const response = await AdvocateController.getAdvocateById(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('DatabaseError');
      expect(responseData.message).toBe('Database connection failed');
    });
  });

  describe('getAdvocatesByCity', () => {
    const mockAdvocates = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        degree: 'MD',
        specialties: ['Cardiology'],
        yearsOfExperience: 10,
        phoneNumber: 1234567890,
        createdAt: new Date()
      }
    ];

    it('should return advocates for given city', async () => {
      mockAdvocateService.getAdvocatesByCity.mockResolvedValue(mockAdvocates);

      const request = new Request('http://localhost:3000/api/advocates/city?city=New%20York');

      const response = await AdvocateController.getAdvocatesByCity(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.data).toEqual(mockAdvocates.map(advocate => ({
        ...advocate,
        createdAt: advocate.createdAt.toISOString()
      })));
      expect(mockAdvocateService.getAdvocatesByCity).toHaveBeenCalledWith('New York');
    });

    it('should handle missing city parameter', async () => {
      const request = new Request('http://localhost:3000/api/advocates/city');

      const response = await AdvocateController.getAdvocatesByCity(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('InvalidParameterError');
      expect(responseData.message).toBe('City parameter is required');
      expect(responseData.parameter).toBe('city');
    });

    it('should handle validation errors', async () => {
      const validationError = new ValidationError('City parameter is required', 'city');
      mockAdvocateService.getAdvocatesByCity.mockRejectedValue(validationError);

      const request = new Request('http://localhost:3000/api/advocates/city?city=');

      const response = await AdvocateController.getAdvocatesByCity(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('InvalidParameterError');
      expect(responseData.message).toBe('City parameter is required');
    });

    it('should handle database errors', async () => {
      const databaseError = new DatabaseError('Database connection failed');
      mockAdvocateService.getAdvocatesByCity.mockRejectedValue(databaseError);

      const request = new Request('http://localhost:3000/api/advocates/city?city=New%20York');

      const response = await AdvocateController.getAdvocatesByCity(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('DatabaseError');
      expect(responseData.message).toBe('Database connection failed');
    });

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Unknown error occurred');
      mockAdvocateService.getAdvocatesByCity.mockRejectedValue(unknownError);

      const request = new Request('http://localhost:3000/api/advocates/city?city=New%20York');

      const response = await AdvocateController.getAdvocatesByCity(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('DatabaseError');
      expect(responseData.message).toBe('Unknown error occurred');
    });
  });

  describe('parameter parsing', () => {
    it('should parse numeric parameters correctly', async () => {
      mockAdvocateService.getAdvocates.mockResolvedValue({
        data: [],
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });

      const request = new Request('http://localhost:3000/api/advocates?page=2&limit=50&minExperience=10&maxExperience=20');

      await AdvocateController.getAdvocates(request);

      expect(mockAdvocateService.getAdvocates).toHaveBeenCalledWith(
        {
          search: undefined,
          city: undefined,
          degree: undefined,
          minExperience: 10,
          maxExperience: 20
        },
        {
          sortBy: 'lastName',
          sortOrder: 'asc'
        },
        {
          page: 2,
          limit: 50
        }
      );
    });

    it('should handle empty string parameters', async () => {
      mockAdvocateService.getAdvocates.mockResolvedValue({
        data: [],
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });

      const request = new Request('http://localhost:3000/api/advocates?search=&city=&degree=');

      await AdvocateController.getAdvocates(request);

      expect(mockAdvocateService.getAdvocates).toHaveBeenCalledWith(
        {
          search: undefined,
          city: undefined,
          degree: undefined,
          minExperience: undefined,
          maxExperience: undefined
        },
        {
          sortBy: 'lastName',
          sortOrder: 'asc'
        },
        {
          page: 1,
          limit: 20
        }
      );
    });

    it('should handle URL encoded parameters', async () => {
      mockAdvocateService.getAdvocates.mockResolvedValue({
        data: [],
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      });

      const request = new Request('http://localhost:3000/api/advocates?search=Dr.%20John&city=Los%20Angeles');

      await AdvocateController.getAdvocates(request);

      expect(mockAdvocateService.getAdvocates).toHaveBeenCalledWith(
        {
          search: 'Dr. John',
          city: 'Los Angeles',
          degree: undefined,
          minExperience: undefined,
          maxExperience: undefined
        },
        {
          sortBy: 'lastName',
          sortOrder: 'asc'
        },
        {
          page: 1,
          limit: 20
        }
      );
    });
  });
}); 
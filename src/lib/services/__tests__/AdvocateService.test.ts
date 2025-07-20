import { AdvocateService } from '../AdvocateService';
import { AdvocateRepository } from '../../repositories/AdvocateRepository';
import { 
  ValidationError, 
  ResourceNotFoundError, 
  DatabaseError 
} from '../../errors/AppError';
import type { AdvocateFilters, AdvocateSortOptions, PaginationOptions } from '../../repositories/AdvocateRepository';

// Mock the repository
jest.mock('../../repositories/AdvocateRepository');
const mockAdvocateRepository = AdvocateRepository as jest.Mocked<typeof AdvocateRepository>;

describe('AdvocateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdvocates', () => {
    const mockFilters: AdvocateFilters = {
      search: 'test',
      city: 'New York',
      degree: 'MD',
      minExperience: 5,
      maxExperience: 15
    };

    const mockSortOptions: AdvocateSortOptions = {
      sortBy: 'lastName',
      sortOrder: 'asc'
    };

    const mockPagination: PaginationOptions = {
      page: 1,
      limit: 20
    };

    const mockResult = {
      data: [
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
      ],
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    };

    it('should return advocates when valid parameters provided', async () => {
      mockAdvocateRepository.findWithFilters.mockResolvedValue(mockResult);

      const result = await AdvocateService.getAdvocates(mockFilters, mockSortOptions, mockPagination);

      expect(result).toEqual(mockResult);
      expect(mockAdvocateRepository.findWithFilters).toHaveBeenCalledWith(
        mockFilters,
        mockSortOptions,
        mockPagination
      );
    });

    it('should throw ValidationError when minExperience > maxExperience', async () => {
      const invalidFilters: AdvocateFilters = {
        ...mockFilters,
        minExperience: 15,
        maxExperience: 5
      };

      await expect(
        AdvocateService.getAdvocates(invalidFilters, mockSortOptions, mockPagination)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when minExperience is negative', async () => {
      const invalidFilters: AdvocateFilters = {
        ...mockFilters,
        minExperience: -5
      };

      await expect(
        AdvocateService.getAdvocates(invalidFilters, mockSortOptions, mockPagination)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when maxExperience is negative', async () => {
      const invalidFilters: AdvocateFilters = {
        ...mockFilters,
        maxExperience: -5
      };

      await expect(
        AdvocateService.getAdvocates(invalidFilters, mockSortOptions, mockPagination)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when sortBy is invalid', async () => {
      const invalidSortOptions: AdvocateSortOptions = {
        sortBy: 'invalidField',
        sortOrder: 'asc'
      };

      await expect(
        AdvocateService.getAdvocates(mockFilters, invalidSortOptions, mockPagination)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when sortOrder is invalid', async () => {
      const invalidSortOptions: AdvocateSortOptions = {
        sortBy: 'lastName',
        sortOrder: 'invalid' as 'asc' | 'desc'
      };

      await expect(
        AdvocateService.getAdvocates(mockFilters, invalidSortOptions, mockPagination)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when page is less than 1', async () => {
      const invalidPagination: PaginationOptions = {
        page: 0,
        limit: 20
      };

      await expect(
        AdvocateService.getAdvocates(mockFilters, mockSortOptions, invalidPagination)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when limit is less than 1', async () => {
      const invalidPagination: PaginationOptions = {
        page: 1,
        limit: 0
      };

      await expect(
        AdvocateService.getAdvocates(mockFilters, mockSortOptions, invalidPagination)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when limit is greater than 100', async () => {
      const invalidPagination: PaginationOptions = {
        page: 1,
        limit: 101
      };

      await expect(
        AdvocateService.getAdvocates(mockFilters, mockSortOptions, invalidPagination)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw DatabaseError when repository throws error', async () => {
      const repositoryError = new Error('Database connection failed');
      mockAdvocateRepository.findWithFilters.mockRejectedValue(repositoryError);

      await expect(
        AdvocateService.getAdvocates(mockFilters, mockSortOptions, mockPagination)
      ).rejects.toThrow(DatabaseError);
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
      mockAdvocateRepository.findById.mockResolvedValue(mockAdvocate);

      const result = await AdvocateService.getAdvocateById(1);

      expect(result).toEqual(mockAdvocate);
      expect(mockAdvocateRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw ValidationError when id is 0', async () => {
      await expect(AdvocateService.getAdvocateById(0)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when id is negative', async () => {
      await expect(AdvocateService.getAdvocateById(-1)).rejects.toThrow(ValidationError);
    });

    it('should throw ResourceNotFoundError when advocate not found', async () => {
      mockAdvocateRepository.findById.mockResolvedValue(null);

      await expect(AdvocateService.getAdvocateById(999)).rejects.toThrow(ResourceNotFoundError);
    });

    it('should throw DatabaseError when repository throws error', async () => {
      const repositoryError = new Error('Database connection failed');
      mockAdvocateRepository.findById.mockRejectedValue(repositoryError);

      await expect(AdvocateService.getAdvocateById(1)).rejects.toThrow(DatabaseError);
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

    it('should return advocates when valid city provided', async () => {
      mockAdvocateRepository.findByCity.mockResolvedValue(mockAdvocates);

      const result = await AdvocateService.getAdvocatesByCity('New York');

      expect(result).toEqual(mockAdvocates);
      expect(mockAdvocateRepository.findByCity).toHaveBeenCalledWith('New York');
    });

    it('should throw ValidationError when city is empty', async () => {
      await expect(AdvocateService.getAdvocatesByCity('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when city is only whitespace', async () => {
      await expect(AdvocateService.getAdvocatesByCity('   ')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when city is undefined', async () => {
      await expect(AdvocateService.getAdvocatesByCity(undefined as any)).rejects.toThrow(ValidationError);
    });

    it('should throw DatabaseError when repository throws error', async () => {
      const repositoryError = new Error('Database connection failed');
      mockAdvocateRepository.findByCity.mockRejectedValue(repositoryError);

      await expect(AdvocateService.getAdvocatesByCity('New York')).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAllAdvocates', () => {
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

    it('should return all advocates', async () => {
      mockAdvocateRepository.findAll.mockResolvedValue(mockAdvocates);

      const result = await AdvocateService.getAllAdvocates();

      expect(result).toEqual(mockAdvocates);
      expect(mockAdvocateRepository.findAll).toHaveBeenCalled();
    });

    it('should throw DatabaseError when repository throws error', async () => {
      const repositoryError = new Error('Database connection failed');
      mockAdvocateRepository.findAll.mockRejectedValue(repositoryError);

      await expect(AdvocateService.getAllAdvocates()).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAdvocateCount', () => {
    it('should return advocate count', async () => {
      mockAdvocateRepository.count.mockResolvedValue(42);

      const result = await AdvocateService.getAdvocateCount();

      expect(result).toBe(42);
      expect(mockAdvocateRepository.count).toHaveBeenCalled();
    });

    it('should throw DatabaseError when repository throws error', async () => {
      const repositoryError = new Error('Database connection failed');
      mockAdvocateRepository.count.mockRejectedValue(repositoryError);

      await expect(AdvocateService.getAdvocateCount()).rejects.toThrow(DatabaseError);
    });
  });

  describe('getDistinctCities', () => {
    it('should return distinct cities', async () => {
      const mockCities = ['New York', 'Los Angeles', 'Chicago'];
      mockAdvocateRepository.getDistinctCities.mockResolvedValue(mockCities);

      const result = await AdvocateService.getDistinctCities();

      expect(result).toEqual(mockCities);
      expect(mockAdvocateRepository.getDistinctCities).toHaveBeenCalled();
    });

    it('should throw DatabaseError when repository throws error', async () => {
      const repositoryError = new Error('Database connection failed');
      mockAdvocateRepository.getDistinctCities.mockRejectedValue(repositoryError);

      await expect(AdvocateService.getDistinctCities()).rejects.toThrow(DatabaseError);
    });
  });

  describe('getDistinctDegrees', () => {
    it('should return distinct degrees', async () => {
      const mockDegrees = ['MD', 'DO', 'NP'];
      mockAdvocateRepository.getDistinctDegrees.mockResolvedValue(mockDegrees);

      const result = await AdvocateService.getDistinctDegrees();

      expect(result).toEqual(mockDegrees);
      expect(mockAdvocateRepository.getDistinctDegrees).toHaveBeenCalled();
    });

    it('should throw DatabaseError when repository throws error', async () => {
      const repositoryError = new Error('Database connection failed');
      mockAdvocateRepository.getDistinctDegrees.mockRejectedValue(repositoryError);

      await expect(AdvocateService.getDistinctDegrees()).rejects.toThrow(DatabaseError);
    });
  });

  describe('validation methods', () => {
    describe('validateFilters', () => {
      it('should not throw when filters are valid', () => {
        const validFilters: AdvocateFilters = {
          minExperience: 5,
          maxExperience: 15
        };

        expect(() => AdvocateService.validateFilters(validFilters)).not.toThrow();
      });

      it('should throw when minExperience > maxExperience', () => {
        const invalidFilters: AdvocateFilters = {
          minExperience: 15,
          maxExperience: 5
        };

        expect(() => AdvocateService.validateFilters(invalidFilters)).toThrow(ValidationError);
      });

      it('should throw when minExperience is negative', () => {
        const invalidFilters: AdvocateFilters = {
          minExperience: -5
        };

        expect(() => AdvocateService.validateFilters(invalidFilters)).toThrow(ValidationError);
      });

      it('should throw when maxExperience is negative', () => {
        const invalidFilters: AdvocateFilters = {
          maxExperience: -5
        };

        expect(() => AdvocateService.validateFilters(invalidFilters)).toThrow(ValidationError);
      });
    });

    describe('validateSortOptions', () => {
      it('should not throw when sort options are valid', () => {
        const validSortOptions: AdvocateSortOptions = {
          sortBy: 'lastName',
          sortOrder: 'asc'
        };

        expect(() => AdvocateService.validateSortOptions(validSortOptions)).not.toThrow();
      });

      it('should throw when sortBy is invalid', () => {
        const invalidSortOptions: AdvocateSortOptions = {
          sortBy: 'invalidField',
          sortOrder: 'asc'
        };

        expect(() => AdvocateService.validateSortOptions(invalidSortOptions)).toThrow(ValidationError);
      });

      it('should throw when sortOrder is invalid', () => {
        const invalidSortOptions: AdvocateSortOptions = {
          sortBy: 'lastName',
          sortOrder: 'invalid' as 'asc' | 'desc'
        };

        expect(() => AdvocateService.validateSortOptions(invalidSortOptions)).toThrow(ValidationError);
      });
    });

    describe('validatePagination', () => {
      it('should not throw when pagination is valid', () => {
        const validPagination: PaginationOptions = {
          page: 1,
          limit: 20
        };

        expect(() => AdvocateService.validatePagination(validPagination)).not.toThrow();
      });

      it('should throw when page is less than 1', () => {
        const invalidPagination: PaginationOptions = {
          page: 0,
          limit: 20
        };

        expect(() => AdvocateService.validatePagination(invalidPagination)).toThrow(ValidationError);
      });

      it('should throw when limit is less than 1', () => {
        const invalidPagination: PaginationOptions = {
          page: 1,
          limit: 0
        };

        expect(() => AdvocateService.validatePagination(invalidPagination)).toThrow(ValidationError);
      });

      it('should throw when limit is greater than 100', () => {
        const invalidPagination: PaginationOptions = {
          page: 1,
          limit: 101
        };

        expect(() => AdvocateService.validatePagination(invalidPagination)).toThrow(ValidationError);
      });
    });
  });
}); 
import { AdvocateRepository, type AdvocateFilters, type AdvocateSortOptions, type PaginationOptions } from '../AdvocateRepository';
import type { Advocate } from '@/types';

// Mock the database module
jest.mock('@/db', () => ({
  __esModule: true,
  default: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              offset: jest.fn(() => Promise.resolve([]))
            }))
          }))
        }))
      }))
    })),
    selectDistinct: jest.fn(() => ({
      from: jest.fn(() => ({
        orderBy: jest.fn(() => Promise.resolve([]))
      }))
    }))
  }
}));

// Mock the schema
jest.mock('@/db/schema', () => ({
  advocates: {
    id: { name: 'id' },
    firstName: { name: 'first_name' },
    lastName: { name: 'last_name' },
    city: { name: 'city' },
    degree: { name: 'degree' },
    specialties: { name: 'specialties' },
    yearsOfExperience: { name: 'years_of_experience' },
    phoneNumber: { name: 'phone_number' },
    createdAt: { name: 'created_at' }
  }
}));

describe('AdvocateRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = require('@/db').default;
    // Ensure selectDistinct is properly mocked
    if (!mockDb.selectDistinct) {
      mockDb.selectDistinct = jest.fn(() => ({
        from: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([]))
        }))
      }));
    }
  });

  describe('findWithFilters', () => {
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

    it('should return empty result when no data found', async () => {
      // Mock empty result
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue([])
              })
            })
          })
        })
      });

      const result = await AdvocateRepository.findWithFilters(mockFilters, mockSortOptions, mockPagination);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it('should handle database connection error', async () => {
      // Mock database not configured by setting db to null
      const originalDb = require('@/db').default;
      require('@/db').default = null;

      await expect(
        AdvocateRepository.findWithFilters(mockFilters, mockSortOptions, mockPagination)
      ).rejects.toThrow('Database not configured');

      // Restore the original db
      require('@/db').default = originalDb;
    });

    it('should build search conditions correctly', async () => {
      const mockData = [
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

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue(mockData)
              })
            })
          })
        })
      });

      const result = await AdvocateRepository.findWithFilters(mockFilters, mockSortOptions, mockPagination);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.firstName).toBe('John');
      expect(result.data[0]?.lastName).toBe('Doe');
    });
  });

  describe('findById', () => {
    it('should return advocate when found', async () => {
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

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockAdvocate])
          })
        })
      });

      const result = await AdvocateRepository.findById(1);

      expect(result).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        degree: 'MD',
        specialties: ['Cardiology'],
        yearsOfExperience: 10,
        phoneNumber: 1234567890,
        createdAt: expect.any(Date)
      });
    });

    it('should return null when advocate not found', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      });

      const result = await AdvocateRepository.findById(999);

      expect(result).toBeNull();
    });

    it('should handle database connection error', async () => {
      // Mock database not configured by setting db to null
      const originalDb = require('@/db').default;
      require('@/db').default = null;

      await expect(AdvocateRepository.findById(1)).rejects.toThrow('Database not configured');

      // Restore the original db
      require('@/db').default = originalDb;
    });
  });

  describe('findByCity', () => {
    it('should return advocates for given city', async () => {
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
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          city: 'New York',
          degree: 'DO',
          specialties: ['Neurology'],
          yearsOfExperience: 8,
          phoneNumber: 9876543210,
          createdAt: new Date()
        }
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockAdvocates)
        })
      });

      const result = await AdvocateRepository.findByCity('New York');

      expect(result).toHaveLength(2);
      expect(result[0]?.city).toBe('New York');
      expect(result[1]?.city).toBe('New York');
    });

    it('should return empty array when no advocates found in city', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      });

      const result = await AdvocateRepository.findByCity('NonExistentCity');

      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return all advocates', async () => {
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

      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue(mockAdvocates)
      });

      const result = await AdvocateRepository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]?.firstName).toBe('John');
    });
  });

  describe('count', () => {
    it('should return total count of advocates', async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockResolvedValue([{ count: 42 }])
      });

      const result = await AdvocateRepository.count();

      expect(result).toBe(42);
    });
  });

  describe('getDistinctCities', () => {
    it('should return distinct cities', async () => {
      const mockCities = [
        { city: 'New York' },
        { city: 'Los Angeles' },
        { city: 'Chicago' }
      ];

      mockDb.selectDistinct.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockCities)
        })
      });

      const result = await AdvocateRepository.getDistinctCities();

      expect(result).toEqual(['New York', 'Los Angeles', 'Chicago']);
    });
  });

  describe('getDistinctDegrees', () => {
    it('should return distinct degrees', async () => {
      const mockDegrees = [
        { degree: 'MD' },
        { degree: 'DO' },
        { degree: 'NP' }
      ];

      mockDb.selectDistinct.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockDegrees)
        })
      });

      const result = await AdvocateRepository.getDistinctDegrees();

      expect(result).toEqual(['MD', 'DO', 'NP']);
    });
  });

  describe('data mapping', () => {
    it('should handle specialties as array', async () => {
      const mockData = [{
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        degree: 'MD',
        specialties: ['Cardiology', 'Internal Medicine'],
        yearsOfExperience: 10,
        phoneNumber: 1234567890,
        createdAt: new Date()
      }];

      // Mock the complete chain for findWithFilters with conditions
      const mockOffset = jest.fn().mockResolvedValue(mockData);
      const mockLimit = jest.fn().mockReturnValue({ offset: mockOffset });
      const mockOrderBy = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await AdvocateRepository.findWithFilters({ search: 'test' }, { sortBy: 'lastName', sortOrder: 'asc' }, { page: 1, limit: 20 });

      expect(result.data[0]?.specialties).toEqual(['Cardiology', 'Internal Medicine']);
    });

    it('should handle specialties as non-array', async () => {
      const mockData = [{
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        degree: 'MD',
        specialties: 'Cardiology', // Not an array
        yearsOfExperience: 10,
        phoneNumber: 1234567890,
        createdAt: new Date()
      }];

      // Mock the complete chain for findWithFilters with conditions
      const mockOffset = jest.fn().mockResolvedValue(mockData);
      const mockLimit = jest.fn().mockReturnValue({ offset: mockOffset });
      const mockOrderBy = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      
      mockDb.select.mockReturnValue({ from: mockFrom });

      const result = await AdvocateRepository.findWithFilters({ search: 'test' }, { sortBy: 'lastName', sortOrder: 'asc' }, { page: 1, limit: 20 });

      expect(result.data[0]?.specialties).toEqual([]);
    });
  });
}); 
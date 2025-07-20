import { AdvocateRepository, type AdvocateFilters, type AdvocateSortOptions, type PaginationOptions, type AdvocateQueryResult } from "@/lib/repositories/AdvocateRepository";
import { DatabaseError, ResourceNotFoundError, ValidationError, AppError } from "@/lib/errors/AppError";
import type { Advocate } from "@/types";

export class AdvocateService {
  static async getAdvocates(
    filters: AdvocateFilters,
    sortOptions: AdvocateSortOptions,
    pagination: PaginationOptions
  ): Promise<AdvocateQueryResult> {
    try {
      // Validate inputs
      this.validateFilters(filters);
      this.validateSortOptions(sortOptions);
      this.validatePagination(pagination);

      return await AdvocateRepository.findWithFilters(filters, sortOptions, pagination);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch advocates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAdvocateById(id: number): Promise<Advocate> {
    try {
      if (!id || id <= 0) {
        throw new ValidationError('Invalid advocate ID', 'id', id);
      }

      const advocate = await AdvocateRepository.findById(id);
      if (!advocate) {
        throw new ResourceNotFoundError('Advocate', id);
      }
      return advocate;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch advocate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAdvocatesByCity(city: string): Promise<Advocate[]> {
    try {
      if (!city?.trim()) {
        throw new ValidationError('City parameter is required', 'city');
      }
      return await AdvocateRepository.findByCity(city);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(`Failed to fetch advocates by city: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAllAdvocates(): Promise<Advocate[]> {
    try {
      return await AdvocateRepository.findAll();
    } catch (error) {
      throw new DatabaseError(`Failed to fetch all advocates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAdvocateCount(): Promise<number> {
    try {
      return await AdvocateRepository.count();
    } catch (error) {
      throw new DatabaseError(`Failed to get advocate count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getDistinctCities(): Promise<string[]> {
    try {
      return await AdvocateRepository.getDistinctCities();
    } catch (error) {
      throw new DatabaseError(`Failed to get distinct cities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getDistinctDegrees(): Promise<string[]> {
    try {
      return await AdvocateRepository.getDistinctDegrees();
    } catch (error) {
      throw new DatabaseError(`Failed to get distinct degrees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static validateFilters(filters: AdvocateFilters): void {
    if (filters.minExperience !== undefined && filters.maxExperience !== undefined) {
      if (filters.minExperience > filters.maxExperience) {
        throw new ValidationError(
          'Minimum experience cannot be greater than maximum experience',
          'experienceRange'
        );
      }
    }

    if (filters.minExperience !== undefined && filters.minExperience < 0) {
      throw new ValidationError(
        'Minimum experience cannot be negative',
        'minExperience',
        filters.minExperience
      );
    }

    if (filters.maxExperience !== undefined && filters.maxExperience < 0) {
      throw new ValidationError(
        'Maximum experience cannot be negative',
        'maxExperience',
        filters.maxExperience
      );
    }
  }

  static validateSortOptions(sortOptions: AdvocateSortOptions): void {
    const validSortFields = ['firstName', 'lastName', 'city', 'degree', 'yearsOfExperience', 'createdAt'];
    if (!validSortFields.includes(sortOptions.sortBy)) {
      throw new ValidationError(
        `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`,
        'sortBy',
        sortOptions.sortBy
      );
    }

    if (!['asc', 'desc'].includes(sortOptions.sortOrder)) {
      throw new ValidationError(
        'Invalid sort order. Must be either "asc" or "desc"',
        'sortOrder',
        sortOptions.sortOrder
      );
    }
  }

  static validatePagination(pagination: PaginationOptions): void {
    if (pagination.page < 1) {
      throw new ValidationError(
        'Page number must be greater than 0',
        'page',
        pagination.page
      );
    }

    if (pagination.limit < 1 || pagination.limit > 100) {
      throw new ValidationError(
        'Limit must be between 1 and 100',
        'limit',
        pagination.limit
      );
    }
  }
} 
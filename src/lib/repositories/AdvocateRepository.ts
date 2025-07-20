import { sql, eq, ilike, or, and, gte, lte, asc, desc } from "drizzle-orm";
import db from "@/db";
import { advocates } from "@/db/schema";
import type { Advocate } from "@/types";

// Type for the raw database result
type AdvocateRow = {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: unknown;
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: Date | null;
};

// Helper to convert database row to Advocate type
function mapAdvocateRow(row: AdvocateRow): Advocate {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    city: row.city,
    degree: row.degree,
    specialties: Array.isArray(row.specialties) ? row.specialties as string[] : [],
    yearsOfExperience: row.yearsOfExperience,
    phoneNumber: row.phoneNumber,
    createdAt: row.createdAt
  };
}

export interface AdvocateFilters {
  search?: string | undefined;
  city?: string | undefined;
  degree?: string | undefined;
  minExperience?: number | undefined;
  maxExperience?: number | undefined;
}

export interface AdvocateSortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface AdvocateQueryResult {
  data: Advocate[];
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class AdvocateRepository {
  private static getSortColumn(sortBy: string) {
    switch (sortBy) {
      case 'firstName':
        return advocates.firstName;
      case 'lastName':
        return advocates.lastName;
      case 'city':
        return advocates.city;
      case 'degree':
        return advocates.degree;
      case 'yearsOfExperience':
        return advocates.yearsOfExperience;
      case 'createdAt':
        return advocates.createdAt;
      default:
        return advocates.lastName;
    }
  }

  private static buildSearchConditions(filters: AdvocateFilters) {
    const conditions: any[] = [];
    
    // Search across multiple fields
    if (filters.search?.trim()) {
      const searchLower = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        or(
          ilike(advocates.firstName, searchLower),
          ilike(advocates.lastName, searchLower),
          ilike(advocates.city, searchLower),
          ilike(advocates.degree, searchLower),
          sql`${advocates.specialties}::text ILIKE ${searchLower}`
        )
      );
    }
    
    // Filter by city
    if (filters.city?.trim()) {
      conditions.push(eq(advocates.city, filters.city));
    }
    
    // Filter by degree
    if (filters.degree?.trim()) {
      conditions.push(eq(advocates.degree, filters.degree));
    }
    
    // Filter by experience range
    if (filters.minExperience !== undefined) {
      conditions.push(gte(advocates.yearsOfExperience, filters.minExperience));
    }
    
    if (filters.maxExperience !== undefined) {
      conditions.push(lte(advocates.yearsOfExperience, filters.maxExperience));
    }
    
    return conditions;
  }

  static async findWithFilters(
    filters: AdvocateFilters,
    sortOptions: AdvocateSortOptions,
    pagination: PaginationOptions
  ): Promise<AdvocateQueryResult> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const { page, limit } = pagination;
    const offset = (page - 1) * limit;
    
    // Build conditions
    const conditions = this.buildSearchConditions(filters);
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(advocates)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const total = countResult[0]?.count || 0;
    
    // Apply sorting
    const sortColumn = this.getSortColumn(sortOptions.sortBy);
    const sortDirection = sortOptions.sortOrder === 'desc' ? desc : asc;
    
    // Build the main query
    let rawData: AdvocateRow[];
    if (conditions.length > 0) {
      rawData = await db
        .select()
        .from(advocates)
        .where(and(...conditions))
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);
    } else {
      rawData = await db
        .select()
        .from(advocates)
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);
    }
    
    const data = rawData.map(mapAdvocateRow);
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  static async findById(id: number): Promise<Advocate | null> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const result = await db
      .select()
      .from(advocates)
      .where(eq(advocates.id, id))
      .limit(1);

    return result[0] ? mapAdvocateRow(result[0] as AdvocateRow) : null;
  }

  static async findByCity(city: string): Promise<Advocate[]> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const rawData = await db
      .select()
      .from(advocates)
      .where(eq(advocates.city, city));

    return rawData.map(mapAdvocateRow);
  }

  static async findAll(): Promise<Advocate[]> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const rawData = await db
      .select()
      .from(advocates);

    return rawData.map(mapAdvocateRow);
  }

  static async count(): Promise<number> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(advocates);

    return result[0]?.count || 0;
  }

  static async getDistinctCities(): Promise<string[]> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const result = await db
      .selectDistinct({ city: advocates.city })
      .from(advocates)
      .orderBy(asc(advocates.city));

    return result.map(row => row.city);
  }

  static async getDistinctDegrees(): Promise<string[]> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const result = await db
      .selectDistinct({ degree: advocates.degree })
      .from(advocates)
      .orderBy(asc(advocates.degree));

    return result.map(row => row.degree);
  }
} 
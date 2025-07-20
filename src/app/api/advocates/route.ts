import type { ApiResponse } from "@/types";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { sql, eq, ilike, or, and, gte, lte, asc, desc } from "drizzle-orm";

export async function GET(request: Request): Promise<Response> {
  try {
    if (!db) {
      return Response.json(
        { error: "Database not configured. Please ensure the database is running." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const degree = searchParams.get('degree') || '';
    const minExperience = searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience')!) : undefined;
    const maxExperience = searchParams.get('maxExperience') ? parseInt(searchParams.get('maxExperience')!) : undefined;
    const sortBy = searchParams.get('sortBy') || 'lastName';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    
    const offset = (page - 1) * limit;
    
    // Build dynamic query conditions
    const conditions: any[] = [];
    
    // Search across multiple fields
    if (search.trim()) {
      const searchLower = `%${search.toLowerCase()}%`;
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
    if (city.trim()) {
      conditions.push(eq(advocates.city, city));
    }
    
    // Filter by degree
    if (degree.trim()) {
      conditions.push(eq(advocates.degree, degree));
    }
    
    // Filter by experience range
    if (minExperience !== undefined) {
      conditions.push(gte(advocates.yearsOfExperience, minExperience));
    }
    
    if (maxExperience !== undefined) {
      conditions.push(lte(advocates.yearsOfExperience, maxExperience));
    }
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(advocates)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const count = countResult[0]?.count || 0;
    
    // Apply sorting
    const sortColumn = getSortColumn(sortBy);
    const sortDirection = sortOrder === 'desc' ? desc : asc;
    
    // Build the main query with conditions and sorting
    let data;
    if (conditions.length > 0) {
      data = await db
        .select()
        .from(advocates)
        .where(and(...conditions))
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);
    } else {
      data = await db
        .select()
        .from(advocates)
        .orderBy(sortDirection(sortColumn))
        .limit(limit)
        .offset(offset);
    }
    
    const totalPages = Math.ceil(count / limit);
    
    const response: ApiResponse<typeof data> = {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    
    return Response.json(response);
    
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error getting advocates");
    console.error("Error fetching advocates:", error);
    const errorResponse: ApiResponse<never> = {
      data: [] as never,
      error: "Failed to fetch advocates",
      message: error.message
    };
    return Response.json(errorResponse, { status: 500 });
  }
}

// Helper function to get the correct column for sorting
function getSortColumn(sortBy: string) {
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

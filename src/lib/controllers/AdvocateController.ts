import { AdvocateService } from "../services/AdvocateService";
import type { AdvocateFilters, AdvocateSortOptions, PaginationOptions } from "../repositories/AdvocateRepository";
import { toErrorResponse, handleUnknownError, InvalidParameterError } from "../errors/AppError";
import type { ApiResponse } from "@/types";

export class AdvocateController {
  static async getAdvocates(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      
      // Parse and validate pagination parameters
      const pageParam = searchParams.get('page');
      const limitParam = searchParams.get('limit');
      
      const page = pageParam ? parseInt(pageParam) : 1;
      const limit = limitParam ? parseInt(limitParam) : 20;
      
      // Validate pagination parameters
      if (pageParam && (isNaN(page) || page < 1)) {
        throw new InvalidParameterError('page', 'Page must be a positive integer');
      }
      if (limitParam && (isNaN(limit) || limit < 1 || limit > 100)) {
        throw new InvalidParameterError('limit', 'Limit must be between 1 and 100');
      }
      
      // Parse filters
      const filters: AdvocateFilters = {
        search: searchParams.get('search') || undefined,
        city: searchParams.get('city') || undefined,
        degree: searchParams.get('degree') || undefined,
        minExperience: searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience')!) : undefined,
        maxExperience: searchParams.get('maxExperience') ? parseInt(searchParams.get('maxExperience')!) : undefined,
      };
      
      // Parse sort options
      const sortOptions: AdvocateSortOptions = {
        sortBy: searchParams.get('sortBy') || 'lastName',
        sortOrder: (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'
      };
      
      const pagination: PaginationOptions = { page, limit };
      
      // Delegate to service (validation happens in service layer)
      const result = await AdvocateService.getAdvocates(filters, sortOptions, pagination);
      
      // Build response
      const response: ApiResponse<typeof result.data> = {
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        }
      };
      
      return Response.json(response);
      
    } catch (error) {
      console.error("Error in AdvocateController.getAdvocates:", error);
      
      const appError = handleUnknownError(error);
      const errorResponse = toErrorResponse(appError, request.url);
      
      return Response.json(
        { 
          data: [] as never,
          error: errorResponse.error,
          message: errorResponse.message,
          code: errorResponse.code,
          parameter: errorResponse.parameter,
          field: errorResponse.field
        }, 
        { status: appError.statusCode }
      );
    }
  }

  static async getAdvocateById(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      
      if (!id) {
        throw new InvalidParameterError('id', 'Advocate ID is required');
      }
      
      const advocateId = parseInt(id);
      if (isNaN(advocateId)) {
        throw new InvalidParameterError('id', 'Invalid advocate ID format');
      }
      
      const advocate = await AdvocateService.getAdvocateById(advocateId);
      
      const response: ApiResponse<typeof advocate> = {
        data: advocate
      };
      
      return Response.json(response);
      
    } catch (error) {
      console.error("Error in AdvocateController.getAdvocateById:", error);
      
      const appError = handleUnknownError(error);
      const errorResponse = toErrorResponse(appError, request.url);
      
      return Response.json(
        { 
          data: null as never,
          error: errorResponse.error,
          message: errorResponse.message,
          code: errorResponse.code,
          parameter: errorResponse.parameter,
          field: errorResponse.field
        }, 
        { status: appError.statusCode }
      );
    }
  }

  static async getAdvocatesByCity(request: Request): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const city = searchParams.get('city');
      
      if (!city) {
        throw new InvalidParameterError('city', 'City parameter is required');
      }
      
      const advocates = await AdvocateService.getAdvocatesByCity(city);
      
      const response: ApiResponse<typeof advocates> = {
        data: advocates
      };
      
      return Response.json(response);
      
    } catch (error) {
      console.error("Error in AdvocateController.getAdvocatesByCity:", error);
      
      const appError = handleUnknownError(error);
      const errorResponse = toErrorResponse(appError, request.url);
      
      return Response.json(
        { 
          data: [] as never,
          error: errorResponse.error,
          message: errorResponse.message,
          code: errorResponse.code,
          parameter: errorResponse.parameter,
          field: errorResponse.field
        }, 
        { status: appError.statusCode }
      );
    }
  }
} 
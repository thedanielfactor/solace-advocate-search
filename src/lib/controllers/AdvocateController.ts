import { AdvocateService } from "../services/AdvocateService";
import type { AdvocateFilters, AdvocateSortOptions, PaginationOptions } from "../repositories/AdvocateRepository";
import { toErrorResponse, handleUnknownError, InvalidParameterError } from "../errors/AppError";
import { DataProtectionMiddleware } from "../middleware";
import type { ApiResponse } from "@/types";

export class AdvocateController {
  static async getAdvocates(request: Request): Promise<Response> {
    try {
      // Use data protection middleware for validation and sanitization
      const { data: validatedData } = await DataProtectionMiddleware.validateAndSanitizeGetAdvocates(request);
      
      // Extract validated and sanitized data
      const {
        page,
        limit,
        search,
        city,
        degree,
        minExperience,
        maxExperience,
        sortBy,
        sortOrder
      } = validatedData;
      
      // Build filters from validated data
      const filters: AdvocateFilters = {
        search: search || undefined,
        city: city || undefined,
        degree: degree || undefined,
        minExperience: minExperience || undefined,
        maxExperience: maxExperience || undefined,
      };
      
      // Build sort options from validated data
      const sortOptions: AdvocateSortOptions = {
        sortBy: sortBy || 'lastName',
        sortOrder: sortOrder || 'asc'
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
      // Use data protection middleware for validation and sanitization
      const { data: validatedData } = await DataProtectionMiddleware.validateAndSanitizeGetAdvocateById(request);
      
      const advocate = await AdvocateService.getAdvocateById(validatedData.id);
      
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
      // Use data protection middleware for validation and sanitization
      const { data: validatedData } = await DataProtectionMiddleware.validateAndSanitizeGetAdvocatesByCity(request);
      
      const advocates = await AdvocateService.getAdvocatesByCity(validatedData.city);
      
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
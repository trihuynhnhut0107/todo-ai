import { Request, Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export abstract class BaseController {
  /**
   * Send successful response
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  protected sendPaginatedSuccess<T>(
    res: Response,
    data: T,
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = "Success",
    statusCode: number = 200
  ): Response<PaginatedResponse<T>> {
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    message: string = "Internal Server Error",
    statusCode: number = 500,
    error?: string
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  protected sendValidationError(
    res: Response,
    errors: string[] | string,
    message: string = "Validation Error"
  ): Response<ApiResponse> {
    const errorMessage = Array.isArray(errors) ? errors.join(", ") : errors;

    return this.sendError(res, message, 400, errorMessage);
  }

  /**
   * Send not found error response
   */
  protected sendNotFound(
    res: Response,
    resource: string = "Resource"
  ): Response<ApiResponse> {
    return this.sendError(res, `${resource} not found`, 404);
  }

  /**
   * Send unauthorized error response
   */
  protected sendUnauthorized(
    res: Response,
    message: string = "Unauthorized access"
  ): Response<ApiResponse> {
    return this.sendError(res, message, 401);
  }

  /**
   * Send forbidden error response
   */
  protected sendForbidden(
    res: Response,
    message: string = "Access forbidden"
  ): Response<ApiResponse> {
    return this.sendError(res, message, 403);
  }

  /**
   * Handle async operations with error catching
   */
  protected asyncHandler(fn: (req: Request, res: Response) => Promise<any>) {
    return (req: Request, res: Response) => {
      Promise.resolve(fn(req, res)).catch((error) => {
        console.error("Controller error:", error);

        // Handle specific error types
        if (error.name === "ValidationError") {
          return this.sendValidationError(res, error.message);
        }

        if (error.name === "CastError") {
          return this.sendValidationError(res, "Invalid ID format");
        }

        if (error.code === 11000) {
          return this.sendValidationError(res, "Duplicate entry");
        }

        // Default to internal server error
        return this.sendError(
          res,
          "Internal Server Error",
          500,
          process.env.NODE_ENV === "development" ? error.message : undefined
        );
      });
    };
  }

  /**
   * Extract pagination parameters from request
   */
  protected getPaginationParams(req: Request): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit as string) || 10)
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Calculate pagination metadata
   */
  protected calculatePagination(
    page: number,
    limit: number,
    total: number
  ): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

/**
 * Standard API Response wrapper
 * Used by all TSOA controllers
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

/**
 * Paginated API Response wrapper
 * Used for endpoints that return lists with pagination
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}
export interface ErrorResponse {
  success: false;
  message: string;
}

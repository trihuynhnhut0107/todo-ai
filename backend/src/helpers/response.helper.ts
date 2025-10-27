/**
 * Response Helper
 * Response formatting utilities for API responses
 */

import { ApiResponse } from "../types/api-response.types";

export class ResponseHelper {
  /**
   * Format successful API response
   */
  static formatApiResponse<T>(data: T, message: string): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format error API response
   */
  static formatErrorResponse(error: Error): ApiResponse<null> {
    return {
      success: false,
      message: error.message || "An error occurred",
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format API response with custom success status
   */
  static formatCustomResponse<T>(
    success: boolean,
    message: string,
    data: T
  ): ApiResponse<T> {
    return {
      success,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}

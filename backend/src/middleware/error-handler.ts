import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";
import { ValidateError } from "tsoa";

/**
 * Global error handler middleware
 * Should be added after all routes
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TSOA Validation Error
  if (err instanceof ValidateError) {
    console.warn(`Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      success: false,
      message: "Validation Failed",
      errors: err.fields,
      timestamp: new Date().toISOString(),
    });
  }

  // Custom API Error
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Unknown Error
  console.error("Unexpected Error:", err);
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * 404 Not Found handler
 * Should be added before error handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
};

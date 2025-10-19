import * as express from "express";
import { TokenPayload } from "../dtos/auth.dto";

/**
 * Safely extracts the authenticated user from the request.
 * This should only be used in routes protected by @Security("jwt").
 *
 * @param request - Express request object
 * @returns TokenPayload containing user information
 * @throws Error if user is not present (which should never happen in protected routes)
 */
export function getAuthenticatedUser(request: express.Request): TokenPayload {
  if (!request.user) {
    throw new Error(
      "User not authenticated. This should not happen in protected routes. " +
        "Ensure @Security('jwt') is present on the controller method."
    );
  }
  return request.user;
}

/**
 * Extracts the user ID from the authenticated user in the request.
 * This is a convenience function for the most common use case.
 *
 * @param request - Express request object
 * @returns User ID string
 */
export function getUserId(request: express.Request): string {
  return getAuthenticatedUser(request).userId;
}

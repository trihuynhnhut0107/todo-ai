import * as express from "express";
import { TokenPayload } from "../dtos/auth.dto";
import { AuthService } from "../services/auth.service";

// Create a single instance of AuthService to reuse
const authService = new AuthService();

/**
 * TSOA Authentication Handler
 * This is called automatically by TSOA when @Security("jwt") decorator is used
 * It reuses the same AuthService logic as the traditional auth.middleware.ts
 */
export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
): Promise<TokenPayload> {
  if (securityName === "jwt") {
    return new Promise((resolve, reject) => {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        reject(new Error("No authorization header provided"));
        return;
      }

      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        reject(
          new Error("Invalid authorization header format. Use: Bearer <token>")
        );
        return;
      }

      const token = parts[1];

      try {
        // Use the same AuthService that auth.middleware.ts uses
        const decoded = authService.verifyAccessToken(token);

        // Check scopes/roles if provided
        if (scopes && scopes.length > 0) {
          if (!scopes.includes(decoded.role)) {
            reject(new Error("Forbidden: Insufficient permissions"));
            return;
          }
        }

        resolve(decoded);
      } catch (error) {
        reject(new Error("Invalid or expired token"));
      }
    });
  }

  return Promise.reject(new Error("Unknown security name"));
}

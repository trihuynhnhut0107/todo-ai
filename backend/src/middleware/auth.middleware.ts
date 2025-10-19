import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { TokenPayload } from "../dtos/auth.dto";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export class AuthMiddleware {
  private authService = new AuthService();

  /**
   * Verify JWT token and attach user to request
   */
  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: "No authorization header provided",
        });
        return;
      }

      const parts = authHeader.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({
          success: false,
          message: "Invalid authorization header format. Use: Bearer <token>",
        });
        return;
      }

      const token = parts[1];

      try {
        const decoded = this.authService.verifyAccessToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
        return;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Authentication failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Check if user has required role
   */
  authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden: Insufficient permissions",
        });
        return;
      }

      next();
    };
  };

  /**
   * Optional authentication - attaches user if token is valid, but doesn't fail if not
   */
  optionalAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        next();
        return;
      }

      const parts = authHeader.split(" ");

      if (parts.length === 2 && parts[0] === "Bearer") {
        const token = parts[1];

        try {
          const decoded = this.authService.verifyAccessToken(token);
          req.user = decoded;
        } catch (error) {
          // Token is invalid, but we don't fail - just continue without user
        }
      }

      next();
    } catch (error) {
      next();
    }
  };
}

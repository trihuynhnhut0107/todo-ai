import {
  Body,
  Controller,
  Get,
  Post,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
  Request,
} from "tsoa";
import { AuthService } from "../services/auth.service";
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponse,
} from "../dtos/auth.dto";
import { ApiResponse } from "../types/api-response.types";

interface ErrorResponse {
  success: false;
  message: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Route("api/auth")
@Tags("Authentication")
export class AuthController extends Controller {
  private authService = new AuthService();

  /**
   * Register a new user account
   * @summary Register a new user
   * @param registerDto User registration details
   * @returns Newly created user with authentication tokens
   */
  @Post("register")
  @SuccessResponse("201", "User registered successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("409", "User already exists")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async register(
    @Body() registerDto: RegisterDto
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      // Validate input
      if (!registerDto.name || !registerDto.email || !registerDto.password) {
        this.setStatus(400);
        throw new Error("Name, email, and password are required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerDto.email)) {
        this.setStatus(400);
        throw new Error("Invalid email format");
      }

      // Validate password length
      if (registerDto.password.length < 6) {
        this.setStatus(400);
        throw new Error("Password must be at least 6 characters long");
      }

      const result = await this.authService.register(registerDto);

      this.setStatus(201);
      return {
        success: true,
        message: "User registered successfully",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User with this email already exists") {
          this.setStatus(409);
          throw error;
        }
      }
      this.setStatus(500);
      throw error;
    }
  }

  /**
   * Login with email and password
   * @summary User login
   * @param loginDto User login credentials
   * @returns User information with authentication tokens
   */
  @Post("login")
  @SuccessResponse("200", "Login successful")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Invalid credentials")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async login(
    @Body() loginDto: LoginDto
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      // Validate input
      if (!loginDto.email || !loginDto.password) {
        this.setStatus(400);
        throw new Error("Email and password are required");
      }

      const result = await this.authService.login(loginDto);

      return {
        success: true,
        message: "Login successful",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid credentials") {
          this.setStatus(401);
          throw error;
        }
      }
      this.setStatus(500);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @summary Refresh access token
   * @param refreshTokenDto Refresh token
   * @returns New access token
   */
  @Post("refresh")
  @SuccessResponse("200", "Token refreshed successfully")
  @Response<ErrorResponse>("400", "Validation Error")
  @Response<ErrorResponse>("401", "Invalid refresh token")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      if (!refreshTokenDto.refreshToken) {
        this.setStatus(400);
        throw new Error("Refresh token is required");
      }

      const result = await this.authService.refreshToken(
        refreshTokenDto.refreshToken
      );

      return {
        success: true,
        message: "Token refreshed successfully",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid refresh token") {
          this.setStatus(401);
          throw error;
        }
      }
      this.setStatus(500);
      throw error;
    }
  }

  /**
   * Get current authenticated user information
   * @summary Get current user
   * @returns Current user information
   */
  @Get("me")
  @Security("jwt")
  @SuccessResponse("200", "User retrieved successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "User not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getMe(
    @Request() request: Express.Request
  ): Promise<ApiResponse<UserResponse>> {
    try {
      // The user is attached by the expressAuthentication function
      const userId = (request as any).user?.userId;

      if (!userId) {
        this.setStatus(401);
        throw new Error("Unauthorized");
      }

      const user = await this.authService.getUserById(userId);

      if (!user) {
        this.setStatus(404);
        throw new Error("User not found");
      }

      return {
        success: true,
        message: "User retrieved successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        this.setStatus(404);
      } else if (error instanceof Error && error.message === "Unauthorized") {
        this.setStatus(401);
      } else {
        this.setStatus(500);
      }
      throw error;
    }
  }
}

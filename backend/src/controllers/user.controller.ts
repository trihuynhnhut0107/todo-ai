import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from "tsoa";
import { UserService } from "../services/user.service";
import {
  UpdateUserDto,
  UpdatePushTokenDto,
  UserResponseDto,
  UsersListResponseDto,
} from "../dtos/user.dto";
import { ApiResponse, ErrorResponse } from "../types/api-response.types";
import * as express from "express";

@Route("api/users")
@Tags("Users")
@Security("jwt")
export class UserController extends Controller {
  private userService = new UserService();

  /**
   * Get all users in the system with pagination
   * @summary Get all users
   * @param page Page number (default: 1)
   * @param limit Number of users per page (default: 10)
   * @returns Paginated list of users
   */
  @Get()
  @SuccessResponse("200", "Users retrieved successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getAllUsers(
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<ApiResponse<UsersListResponseDto>> {
    const result = await this.userService.getAllUsers(page, limit);

    return {
      success: true,
      message: "Users retrieved successfully",
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get a specific user by ID
   * @summary Get user by ID
   * @param userId The user's unique identifier
   * @returns User information
   */
  @Get("{userId}")
  @SuccessResponse("200", "User retrieved successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "User not found")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getUserById(
    @Path() userId: string
  ): Promise<ApiResponse<UserResponseDto>> {
    const result = await this.userService.getUserById(userId);

    return {
      success: true,
      message: "User retrieved successfully",
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update user information
   * @summary Update user
   * @param userId The user's unique identifier
   * @param updateUserDto User update details
   * @returns Updated user information
   */
  @Put("{userId}")
  @SuccessResponse("200", "User updated successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("404", "User not found")
  @Response<ErrorResponse>("409", "Email already in use")
  @Response<ErrorResponse>("422", "Validation Error")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async updateUser(
    @Path() userId: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<ApiResponse<UserResponseDto>> {
    const result = await this.userService.updateUser(userId, updateUserDto);

    return {
      success: true,
      message: "User updated successfully",
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update the current user's push token for notifications
   * @summary Update push token
   * @param updatePushTokenDto Push token details
   * @returns Success message
   */
  @Post("push-token")
  @SuccessResponse("200", "Push token updated successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("422", "Validation Error")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async updatePushToken(
    @Request() request: express.Request,
    @Body() updatePushTokenDto: UpdatePushTokenDto
  ): Promise<ApiResponse<null>> {
    const userId = request.user!.userId;
    await this.userService.updatePushToken(
      userId,
      updatePushTokenDto.pushToken
    );

    return {
      success: true,
      message: "Push token updated successfully",
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clear the current user's push token (e.g., on logout)
   * @summary Clear push token
   * @returns Success message
   */
  @Delete("push-token")
  @SuccessResponse("200", "Push token cleared successfully")
  @Response<ErrorResponse>("401", "Unauthorized")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async clearPushToken(
    @Request() request: express.Request
  ): Promise<ApiResponse<null>> {
    const userId = request.user!.userId;
    await this.userService.clearPushToken(userId);

    return {
      success: true,
      message: "Push token cleared successfully",
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}

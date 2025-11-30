/**
 * DTO for updating user information
 */
export interface UpdateUserDto {
  /**
   * User's full name
   * @minLength 1
   * @example "John Doe"
   */
  name?: string;

  /**
   * User's email address
   * @format email
   * @pattern ^[^\s@]+@[^\s@]+\.[^\s@]+$
   * @example "john.doe@example.com"
   */
  email?: string;

  /**
   * User's role
   * @example "user"
   */
  role?: string;
}

/**
 * DTO for updating push token
 */
export interface UpdatePushTokenDto {
  /**
   * Expo push token for notifications
   * @example "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
   */
  pushToken: string;
}

/**
 * Response DTO for user information
 */
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response DTO for paginated users list
 */
export interface UsersListResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

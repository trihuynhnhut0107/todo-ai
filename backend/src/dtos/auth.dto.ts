/**
 * @pattern email ^[^\s@]+@[^\s@]+\.[^\s@]+$
 */
export interface RegisterDto {
  /**
   * User's full name
   * @minLength 1
   * @example "John Doe"
   */
  name: string;

  /**
   * User's email address
   * @format email
   * @pattern ^[^\s@]+@[^\s@]+\.[^\s@]+$
   * @example "john.doe@example.com"
   */
  email: string;

  /**
   * User's password
   * @minLength 6
   * @example "securePassword123"
   */
  password: string;
}

export interface LoginDto {
  /**
   * User's email address
   * @format email
   * @pattern ^[^\s@]+@[^\s@]+\.[^\s@]+$
   * @example "john.doe@example.com"
   */
  email: string;

  /**
   * User's password
   * @minLength 1
   * @example "securePassword123"
   */
  password: string;
}

export interface RefreshTokenDto {
  /**
   * JWT refresh token
   * @minLength 1
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

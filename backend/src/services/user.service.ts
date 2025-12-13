import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import { mapboxService } from "./mapbox.service";
import { reminderService } from "./reminder.service";
import {
  UpdateUserDto,
  UserResponseDto,
  UsersListResponseDto,
} from "../dtos/user.dto";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Get all users with pagination
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<UsersListResponseDto> {
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      select: ["id", "name", "email", "role", "createdAt", "updatedAt"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["id", "name", "email", "role", "createdAt", "updatedAt"],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update user information
   */
  async updateUser(
    userId: string,
    updateDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if email is being updated and if it already exists
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateDto.email },
      });

      if (existingUser) {
        throw new ConflictError("Email already in use by another user");
      }
    }

    // Update user fields
    if (updateDto.name !== undefined) {
      user.name = updateDto.name;
    }
    if (updateDto.email !== undefined) {
      user.email = updateDto.email;
    }
    if (updateDto.role !== undefined) {
      user.role = updateDto.role;
    }

    const updatedUser = await this.userRepository.save(user);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  /**
   * Update user's push token for notifications
   */
  async updatePushToken(userId: string, pushToken: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.pushToken = pushToken;
    await this.userRepository.save(user);
  }

  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    // 1. Validate coordinates with Mapbox
    try {
      await mapboxService.reverseGeocode(longitude, latitude);
    } catch (error) {
      console.error("Mapbox validation error:", error);
      throw new BadRequestError(
        "Invalid coordinates or map service unavailable"
      );
    }

    // 2. Update User entity
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.currentLat = latitude.toString();
    user.currentLng = longitude.toString();
    await this.userRepository.save(user);

    // 3. Trigger reminder check
    await reminderService.checkAndPrepareReminders(userId, latitude, longitude);
  }

  /**
   * Clear user's push token (e.g., on logout)
   */
  async clearPushToken(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.pushToken = undefined;
    await this.userRepository.save(user);
  }
}

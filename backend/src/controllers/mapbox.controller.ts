import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { mapboxService } from "../services/mapbox.service";
import { ApiResponse, ErrorResponse } from "../types/api-response.types";
import {
  MapboxProfile,
  MapboxLanguage,
  MapboxCountry,
  MapboxPlaceType,
  MapboxAnnotation,
} from "../enums/mapbox.enum";

interface ForwardGeocodeRequest {
  searchText: string;
  proximity?: string;
  country?: MapboxCountry | string; // Allow enum or custom country codes
  types?: MapboxPlaceType | string; // Allow enum or custom types
  limit?: number;
  language?: MapboxLanguage | string; // Allow enum or custom language codes
  autocomplete?: boolean;
}

interface ReverseGeocodeRequest {
  longitude: number;
  latitude: number;
}

interface TravelTimeRequest {
  origin: {
    longitude: number;
    latitude: number;
  };
  destination: {
    longitude: number;
    latitude: number;
  };
  profile?: MapboxProfile;
}

interface MatrixRequest {
  coordinates: Array<{
    longitude: number;
    latitude: number;
  }>;
  profile?: MapboxProfile;
  annotations?: MapboxAnnotation;
  sources?: number[] | "all";
  destinations?: number[] | "all";
}

@Route("api/mapbox")
@Tags("Mapbox")
export class MapboxController extends Controller {
  /**
   * Forward geocoding - convert place name/address to coordinates
   * @summary Search for a place by name
   * @param request Search parameters
   * @returns Geocoding results with coordinates
   */
  @Post("/geocode/forward")
  @SuccessResponse("200", "Successfully geocoded")
  @Response<ErrorResponse>("400", "Bad Request")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async forwardGeocode(
    @Body() request: ForwardGeocodeRequest
  ): Promise<ApiResponse<any>> {
    try {
      const result = await mapboxService.forwardGeocode(
        request.searchText,
        {
          proximity: request.proximity,
          country: request.country,
          types: request.types,
          limit: request.limit,
          language: request.language,
          autocomplete: request.autocomplete,
        }
      );

      return {
        success: true,
        message: "Place geocoded successfully",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.setStatus(500);
      return {
        success: false,
        message: error.message || "Failed to geocode place",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Reverse geocoding - convert coordinates to place name/address
   * @summary Get place name from coordinates
   * @param request Coordinates
   * @returns Place information
   */
  @Post("/geocode/reverse")
  @SuccessResponse("200", "Successfully reverse geocoded")
  @Response<ErrorResponse>("400", "Bad Request")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async reverseGeocode(
    @Body() request: ReverseGeocodeRequest
  ): Promise<ApiResponse<any>> {
    try {
      const result = await mapboxService.reverseGeocode(
        request.longitude,
        request.latitude
      );

      return {
        success: true,
        message: "Coordinates reverse geocoded successfully",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.setStatus(500);
      return {
        success: false,
        message: error.message || "Failed to reverse geocode coordinates",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get travel time between two locations
   * @summary Calculate travel time
   * @param request Origin, destination, and travel profile
   * @returns Travel time in minutes
   */
  @Post("/travel-time")
  @SuccessResponse("200", "Successfully calculated travel time")
  @Response<ErrorResponse>("400", "Bad Request")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getTravelTime(
    @Body() request: TravelTimeRequest
  ): Promise<ApiResponse<{ travelTimeMinutes: number | null }>> {
    try {
      const travelTime = await mapboxService.getTravelTime(
        request.origin,
        request.destination,
        request.profile || MapboxProfile.DRIVING
      );

      return {
        success: true,
        message: "Travel time calculated successfully",
        data: { travelTimeMinutes: travelTime },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.setStatus(500);
      return {
        success: false,
        message: error.message || "Failed to calculate travel time",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get distance between two locations
   * @summary Calculate distance
   * @param origin Origin coordinates (longitude,latitude)
   * @param destination Destination coordinates (longitude,latitude)
   * @param profile Travel profile (driving, walking, cycling)
   * @returns Distance in kilometers
   */
  @Get("/distance")
  @SuccessResponse("200", "Successfully calculated distance")
  @Response<ErrorResponse>("400", "Bad Request")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getDistance(
    @Query() originLng: number,
    @Query() originLat: number,
    @Query() destLng: number,
    @Query() destLat: number,
    @Query() profile: MapboxProfile = MapboxProfile.DRIVING
  ): Promise<ApiResponse<{ distanceKm: number | null }>> {
    try {
      const distance = await mapboxService.getDistance(
        { longitude: originLng, latitude: originLat },
        { longitude: destLng, latitude: destLat },
        profile
      );

      return {
        success: true,
        message: "Distance calculated successfully",
        data: { distanceKm: distance },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.setStatus(500);
      return {
        success: false,
        message: error.message || "Failed to calculate distance",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get travel time/distance matrix between multiple locations
   * @summary Calculate matrix of travel times/distances
   * @param request Coordinates and matrix parameters
   * @returns Matrix of durations and/or distances
   */
  @Post("/matrix")
  @SuccessResponse("200", "Successfully calculated matrix")
  @Response<ErrorResponse>("400", "Bad Request")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async getMatrix(
    @Body() request: MatrixRequest
  ): Promise<ApiResponse<any>> {
    try {
      const result = await mapboxService.getMatrix(
        request.coordinates,
        request.profile || MapboxProfile.DRIVING,
        {
          annotations: request.annotations,
          sources: request.sources,
          destinations: request.destinations,
        }
      );

      return {
        success: true,
        message: "Matrix calculated successfully",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.setStatus(500);
      return {
        success: false,
        message: error.message || "Failed to calculate matrix",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Search for places with autocomplete
   * @summary Autocomplete search for places
   * @param q Search query
   * @param limit Maximum number of results (1-10)
   * @param proximity Proximity bias (longitude,latitude)
   * @returns Matching places
   */
  @Get("/search")
  @SuccessResponse("200", "Successfully searched")
  @Response<ErrorResponse>("400", "Bad Request")
  @Response<ErrorResponse>("500", "Internal Server Error")
  public async searchPlaces(
    @Query() q: string,
    @Query() limit: number = 5,
    @Query() proximity?: string
  ): Promise<ApiResponse<any>> {
    try {
      const result = await mapboxService.forwardGeocode(q, {
        limit,
        proximity,
        autocomplete: true,
      });

      return {
        success: true,
        message: "Places searched successfully",
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.setStatus(500);
      return {
        success: false,
        message: error.message || "Failed to search places",
        timestamp: new Date().toISOString(),
      };
    }
  }
}

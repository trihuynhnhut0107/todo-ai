import axios from "axios";
import {
  MapboxProfile,
  MapboxLanguage,
  MapboxCountry,
  MapboxPlaceType,
  MapboxAnnotation,
} from "../enums/mapbox.enum";

interface Coordinates {
  longitude: number;
  latitude: number;
}

interface GeocodingFeature {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    name: string;
    full_address?: string;
    place_formatted?: string;
    [key: string]: unknown;
  };
}

interface GeocodingResponse {
  type: string;
  features: GeocodingFeature[];
  attribution?: string;
}

interface MatrixResponse {
  code: string;
  durations?: number[][]; // Travel time in seconds
  distances?: number[][]; // Distance in meters
  destinations?: Array<{
    distance: number;
    name: string;
    location: [number, number];
  }>;
  sources?: Array<{
    distance: number;
    name: string;
    location: [number, number];
  }>;
}

export class MapboxService {
  private readonly accessToken: string;
  private readonly baseUrl = "https://api.mapbox.com";

  constructor() {
    this.accessToken = process.env.MAPBOX_ACCESS_TOKEN || "";
    if (!this.accessToken) {
      throw new Error("MAPBOX_ACCESS_TOKEN is not configured");
    }
  }

  /**
   * Forward Geocoding: Convert place name/address to coordinates
   * @param searchText - The place name or address (e.g., "White House", "1600 Pennsylvania Avenue")
   * @param options - Optional parameters for the search
   * @returns Geocoding results with coordinates
   */
  async forwardGeocode(
    searchText: string,
    options?: {
      proximity?: string; // Format: "longitude,latitude" or "ip"
      country?: MapboxCountry | string; // Use enum or custom ISO 3166-1 alpha-2 codes
      types?: MapboxPlaceType | string; // Use enum or custom place types
      limit?: number; // Max results (1-10)
      language?: MapboxLanguage | string; // Use enum or custom ISO 639-1 codes
      autocomplete?: boolean; // Enable prefix matching
    }
  ): Promise<GeocodingResponse> {
    const url = `${this.baseUrl}/search/geocode/v6/forward`;

    const params: Record<string, string> = {
      q: searchText,
      access_token: this.accessToken,
    };

    if (options?.proximity) params.proximity = options.proximity;
    if (options?.country) params.country = options.country;
    if (options?.types) params.types = options.types;
    if (options?.limit) params.limit = options.limit.toString();
    if (options?.language) params.language = options.language;
    if (options?.autocomplete !== undefined)
      params.autocomplete = options.autocomplete.toString();

    const response = await axios.get<GeocodingResponse>(url, { params });
    return response.data;
  }

  /**
   * Reverse Geocoding: Convert coordinates to place name/address
   * @param longitude - Longitude coordinate
   * @param latitude - Latitude coordinate
   * @returns Geocoding results with place information
   */
  async reverseGeocode(
    longitude: number,
    latitude: number
  ): Promise<GeocodingResponse> {
    const url = `${this.baseUrl}/search/geocode/v6/reverse`;

    const params = {
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      access_token: this.accessToken,
    };

    const response = await axios.get<GeocodingResponse>(url, { params });
    return response.data;
  }

  /**
   * Matrix API: Calculate travel times and distances between multiple points
   * @param coordinates - Array of coordinates (2-25 points, or 10 for driving-traffic)
   * @param profile - Routing profile: "driving", "walking", "cycling", or "driving-traffic"
   * @param options - Optional parameters for the matrix calculation
   * @returns Matrix of travel times and/or distances
   */
  async getMatrix(
    coordinates: Coordinates[],
    profile: MapboxProfile = MapboxProfile.DRIVING,
    options?: {
      annotations?: MapboxAnnotation | string; // Use enum or custom annotation
      sources?: number[] | "all"; // Which coordinates to use as sources
      destinations?: number[] | "all"; // Which coordinates to use as destinations
      approaches?: Array<"unrestricted" | "curb">; // Side of road to approach from
    }
  ): Promise<MatrixResponse> {
    // Validate coordinate count
    const maxCoordinates =
      profile === MapboxProfile.DRIVING_TRAFFIC ? 10 : 25;
    if (coordinates.length < 2 || coordinates.length > maxCoordinates) {
      throw new Error(
        `Coordinates must be between 2 and ${maxCoordinates} for ${profile} profile`
      );
    }

    // Format coordinates as semicolon-separated "lng,lat" pairs
    const coordString = coordinates
      .map((c) => `${c.longitude},${c.latitude}`)
      .join(";");

    const url = `${this.baseUrl}/directions-matrix/v1/mapbox/${profile}/${coordString}`;

    const params: Record<string, string> = {
      access_token: this.accessToken,
      annotations: options?.annotations || "duration",
    };

    // Add sources parameter
    if (options?.sources) {
      if (Array.isArray(options.sources)) {
        params.sources = options.sources.join(";");
      } else {
        params.sources = "all";
      }
    }

    // Add destinations parameter
    if (options?.destinations) {
      if (Array.isArray(options.destinations)) {
        params.destinations = options.destinations.join(";");
      } else {
        params.destinations = "all";
      }
    }

    // Add approaches parameter
    if (options?.approaches) {
      params.approaches = options.approaches.join(";");
    }

    const response = await axios.get<MatrixResponse>(url, { params });
    return response.data;
  }

  /**
   * Helper: Get travel time between two locations in minutes
   * @param origin - Starting point coordinates
   * @param destination - Ending point coordinates
   * @param profile - Routing profile (default: "driving")
   * @returns Travel time in minutes, or null if no route found
   */
  async getTravelTime(
    origin: Coordinates,
    destination: Coordinates,
    profile: MapboxProfile = MapboxProfile.DRIVING
  ): Promise<number | null> {
    const matrixResult = await this.getMatrix(
      [origin, destination],
      profile,
      { annotations: MapboxAnnotation.DURATION }
    );

    // Matrix returns [origin][destination]
    const durationSeconds = matrixResult.durations?.[0]?.[1];

    if (durationSeconds === null || durationSeconds === undefined) {
      return null;
    }

    return Math.round(durationSeconds / 60); // Convert to minutes
  }

  /**
   * Helper: Get distance between two locations in kilometers
   * @param origin - Starting point coordinates
   * @param destination - Ending point coordinates
   * @param profile - Routing profile (default: "driving")
   * @returns Distance in kilometers, or null if no route found
   */
  async getDistance(
    origin: Coordinates,
    destination: Coordinates,
    profile: MapboxProfile = MapboxProfile.DRIVING
  ): Promise<number | null> {
    const matrixResult = await this.getMatrix(
      [origin, destination],
      profile,
      { annotations: MapboxAnnotation.DISTANCE }
    );

    // Matrix returns [origin][destination]
    const distanceMeters = matrixResult.distances?.[0]?.[1];

    if (distanceMeters === null || distanceMeters === undefined) {
      return null;
    }

    return parseFloat((distanceMeters / 1000).toFixed(2)); // Convert to km, 2 decimals
  }
}

export const mapboxService = new MapboxService();

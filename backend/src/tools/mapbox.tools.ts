import { tool } from "langchain";
import { z } from "zod";
import { mapboxService } from "../services/mapbox.service";
import { MapboxProfile, MapboxAnnotation } from "../enums/mapbox.enum";

/**
 * LangChain tools for Mapbox operations
 * Each tool wraps a corresponding MapboxService method for AI agent usage
 */

/**
 * Tool: Geocode Place Name to Coordinates
 * Converts a place name or address to geographic coordinates
 */
export const geocodePlaceTool = tool(
  async (input) => {
    try {
      const result = await mapboxService.forwardGeocode(input.searchText, {
        limit: input.limit,
        country: input.country,
        types: input.types,
        language: input.language,
        autocomplete: input.autocomplete,
        proximity: input.proximity,
      });

      if (!result.features || result.features.length === 0) {
        return JSON.stringify({
          success: false,
          message: `No locations found for "${input.searchText}"`,
        });
      }

      const topResult = result.features[0];
      return JSON.stringify({
        success: true,
        location: {
          name: topResult.properties.name,
          address: topResult.properties.full_address || topResult.properties.place_formatted,
          coordinates: {
            longitude: topResult.geometry.coordinates[0],
            latitude: topResult.geometry.coordinates[1],
          },
        },
        allResults: result.features.map((f) => ({
          name: f.properties.name,
          coordinates: {
            longitude: f.geometry.coordinates[0],
            latitude: f.geometry.coordinates[1],
          },
        })),
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to geocode place",
      });
    }
  },
  {
    name: "geocode_place",
    description:
      "Convert a place name or address to geographic coordinates. Use this when you need to find the latitude and longitude of a location like 'White House', '1600 Pennsylvania Avenue', 'Eiffel Tower', etc. Returns the top matching location and alternatives.",
    schema: z.object({
      searchText: z
        .string()
        .describe(
          "The place name or address to search for (e.g., 'White House', 'Times Square')"
        ),
      limit: z
        .number()
        .optional()
        .describe("Maximum number of results to return (1-10, default: 5)"),
      country: z
        .string()
        .optional()
        .describe("ISO 3166-1 alpha-2 country code to filter results (e.g., 'us', 'fr')"),
      types: z
        .string()
        .optional()
        .describe(
          "Place types to filter by (e.g., 'address', 'poi', 'place', 'country')"
        ),
      language: z
        .string()
        .optional()
        .describe("ISO 639-1 language code for results (e.g., 'en', 'es', 'fr')"),
      autocomplete: z
        .boolean()
        .optional()
        .describe("Enable prefix matching for autocomplete (default: false)"),
      proximity: z
        .string()
        .optional()
        .describe(
          "Bias results towards a location. Format: 'longitude,latitude' or 'ip'"
        ),
    }),
  }
);

/**
 * Tool: Get Travel Time Between Two Locations
 * Calculates travel time and distance between two geographic points
 */
export const getTravelTimeTool = tool(
  async (input) => {
    try {
      const travelTime = await mapboxService.getTravelTime(
        {
          longitude: input.originLongitude,
          latitude: input.originLatitude,
        },
        {
          longitude: input.destinationLongitude,
          latitude: input.destinationLatitude,
        },
        (input.profile as MapboxProfile) || MapboxProfile.DRIVING
      );

      const distance = await mapboxService.getDistance(
        {
          longitude: input.originLongitude,
          latitude: input.originLatitude,
        },
        {
          longitude: input.destinationLongitude,
          latitude: input.destinationLatitude,
        },
        (input.profile as MapboxProfile) || MapboxProfile.DRIVING
      );

      if (travelTime === null || distance === null) {
        return JSON.stringify({
          success: false,
          message: "Could not calculate route between the two locations",
        });
      }

      return JSON.stringify({
        success: true,
        travelTime: {
          minutes: travelTime,
          hours: (travelTime / 60).toFixed(2),
        },
        distance: {
          kilometers: distance,
          miles: (distance * 0.621371).toFixed(2),
        },
        profile: input.profile || "driving",
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to calculate travel time",
      });
    }
  },
  {
    name: "get_travel_time",
    description:
      "Calculate travel time and distance between two locations. Use this when you need to know how long it takes to travel from one place to another, or the distance between two points. Useful for scheduling events with travel buffers.",
    schema: z.object({
      originLatitude: z.number().describe("Starting latitude coordinate"),
      originLongitude: z.number().describe("Starting longitude coordinate"),
      destinationLatitude: z.number().describe("Destination latitude coordinate"),
      destinationLongitude: z.number().describe("Destination longitude coordinate"),
      profile: z
        .enum([
          MapboxProfile.DRIVING,
          MapboxProfile.WALKING,
          MapboxProfile.CYCLING,
          MapboxProfile.DRIVING_TRAFFIC,
        ])
        .optional()
        .describe(
          "Travel mode: 'driving' (default), 'walking', 'cycling', or 'driving-traffic'"
        ),
    }),
  }
);

/**
 * Tool: Check Location Proximity
 * Determines if two locations are within a specified distance
 */
export const checkLocationProximityTool = tool(
  async (input) => {
    try {
      const distance = await mapboxService.getDistance(
        {
          longitude: input.location1Longitude,
          latitude: input.location1Latitude,
        },
        {
          longitude: input.location2Longitude,
          latitude: input.location2Latitude,
        },
        MapboxProfile.DRIVING
      );

      if (distance === null) {
        return JSON.stringify({
          success: false,
          message: "Could not calculate distance between locations",
        });
      }

      const withinThreshold = distance <= input.maxDistanceKm;

      return JSON.stringify({
        success: true,
        withinThreshold,
        distance: {
          kilometers: distance,
          miles: (distance * 0.621371).toFixed(2),
        },
        message: withinThreshold
          ? `Locations are ${distance.toFixed(2)}km apart (within ${input.maxDistanceKm}km threshold)`
          : `Locations are ${distance.toFixed(2)}km apart (exceeds ${input.maxDistanceKm}km threshold)`,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to check proximity",
      });
    }
  },
  {
    name: "check_location_proximity",
    description:
      "Check if two locations are within a specified distance from each other. Useful for determining if events are too far apart or if locations are close enough for a single trip.",
    schema: z.object({
      location1Latitude: z.number().describe("Latitude of first location"),
      location1Longitude: z.number().describe("Longitude of first location"),
      location2Latitude: z.number().describe("Latitude of second location"),
      location2Longitude: z.number().describe("Longitude of second location"),
      maxDistanceKm: z
        .number()
        .describe(
          "Maximum allowed distance in kilometers to consider locations as 'close'"
        ),
    }),
  }
);

/**
 * Tool: Reverse Geocode Coordinates to Address
 * Converts geographic coordinates to a place name/address
 */
export const reverseGeocodeTool = tool(
  async (input) => {
    try {
      const result = await mapboxService.reverseGeocode(
        input.longitude,
        input.latitude
      );

      if (!result.features || result.features.length === 0) {
        return JSON.stringify({
          success: false,
          message: "No address found for these coordinates",
        });
      }

      const topResult = result.features[0];
      return JSON.stringify({
        success: true,
        address: topResult.properties.name,
        fullAddress:
          topResult.properties.full_address ||
          topResult.properties.place_formatted,
        coordinates: {
          latitude: input.latitude,
          longitude: input.longitude,
        },
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to reverse geocode",
      });
    }
  },
  {
    name: "reverse_geocode",
    description:
      "Convert geographic coordinates (latitude, longitude) to a place name or address. Use this when you have coordinates and need to find out what location they represent.",
    schema: z.object({
      latitude: z.number().describe("Latitude coordinate"),
      longitude: z.number().describe("Longitude coordinate"),
    }),
  }
);

// Export all Mapbox tools as an array for easy agent initialization
export const mapboxTools = [
  geocodePlaceTool,
  getTravelTimeTool,
  checkLocationProximityTool,
  reverseGeocodeTool,
];

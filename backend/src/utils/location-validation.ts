import { mapboxService } from "../services/mapbox.service";
import { BadRequestError } from "./errors";
import { MapboxProfile } from "../enums/mapbox.enum";

/**
 * Location validation and normalization for events
 * Ensures locations are specific and travel logistics are feasible
 */

interface LocationInput {
  location?: string; // Address, place name, or well-known location
  lat?: string | number; // Latitude
  lng?: string | number; // Longitude
}

export interface ValidatedLocation {
  location: string; // Normalized location name/address
  lat: string; // Latitude as string
  lng: string; // Longitude as string
  rawCoordinates: {
    latitude: number;
    longitude: number;
  };
}

interface PreviousEvent {
  id: string;
  start: Date;
  end: Date;
  location?: string;
  lat?: string;
  lng?: string;
}

interface TravelValidationResult {
  isValid: boolean;
  message?: string;
  travelTimeMinutes?: number;
  distanceKm?: number;
}

const MAX_TRAVEL_TIME_MINUTES = parseInt(
  process.env.MAX_TRAVEL_TIME_MINUTES || "30",
  10
);

const VAGUE_LOCATION_PATTERNS = [
  /^(downtown|downtown[\s,]*[a-z]{2,}?)$/i, // "Downtown", "Downtown LA", "Downtown, NY"
  /^(uptown|uptown[\s,]*[a-z]{2,}?)$/i, // "Uptown", "Uptown Manhattan"
  /^(midtown|midtown[\s,]*[a-z]{2,}?)$/i, // "Midtown"
  /^(airport|airport[\s,]*[a-z]{2,}?)$/i, // "Airport" without specific name
  /^(station|station[\s,]*[a-z]{2,}?)$/i, // "Station" without specific name
  /^(somewhere.*)?$/i, // "Somewhere", "Somewhere else"
  /^(here|there)$/i, // "Here", "There"
  /^(nearby|around.*)?$/i, // "Nearby", "Around"
];

const VAGUE_LOCATION_TERMS = [
  "unknown",
  "tbd",
  "to be determined",
  "pending",
  "unconfirmed",
  "maybe",
  "flexible",
];

/**
 * Validates if a location string is too vague
 */
export function isVagueLocation(location: string): boolean {
  const normalized = location.trim().toLowerCase();

  // Check pattern matches
  if (VAGUE_LOCATION_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  // Check specific vague terms
  if (
    VAGUE_LOCATION_TERMS.some((term) => normalized.includes(term))
  ) {
    return true;
  }

  // Too short (less than 3 meaningful characters after spaces)
  if (normalized.replace(/\s+/g, "").length < 3) {
    return true;
  }

  return false;
}

/**
 * Validates and normalizes location input
 * Can accept: address string, lat/lng pair, or well-known place
 *
 * @throws BadRequestError if location is vague or coordinates are invalid
 */
export async function validateAndNormalizeLocation(
  locationInput: LocationInput
): Promise<ValidatedLocation> {
  const { location, lat, lng } = locationInput;

  // Case 1: Both lat and lng provided
  if (lat !== undefined && lng !== undefined) {
    const latitude = typeof lat === "string" ? parseFloat(lat) : lat;
    const longitude = typeof lng === "string" ? parseFloat(lng) : lng;

    // Validate coordinate ranges
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestError(
        "Invalid coordinates: latitude and longitude must be valid numbers"
      );
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestError(
        "Invalid latitude: must be between -90 and 90"
      );
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestError(
        "Invalid longitude: must be between -180 and 180"
      );
    }

    // Get address from coordinates via reverse geocoding
    const geoResult = await mapboxService.reverseGeocode(longitude, latitude);

    if (!geoResult.features || geoResult.features.length === 0) {
      throw new BadRequestError(
        "Could not determine address from the provided coordinates"
      );
    }

    const topFeature = geoResult.features[0];
    const locationName =
      topFeature.properties.full_address ||
      topFeature.properties.place_formatted ||
      topFeature.properties.name;

    return {
      location: locationName,
      lat: latitude.toString(),
      lng: longitude.toString(),
      rawCoordinates: {
        latitude,
        longitude,
      },
    };
  }

  // Case 2: Only location string provided
  if (location) {
    // Check for vague locations
    if (isVagueLocation(location)) {
      throw new BadRequestError(
        `Location "${location}" is too vague. Please provide a more specific location (e.g., street address, business name, landmark name).`
      );
    }

    // Forward geocode the location
    const geoResult = await mapboxService.forwardGeocode(location, {
      limit: 1,
      autocomplete: true,
    });

    if (!geoResult.features || geoResult.features.length === 0) {
      throw new BadRequestError(
        `Location "${location}" not found. Please verify the location name or provide coordinates.`
      );
    }

    const topFeature = geoResult.features[0];
    const [longitude, latitude] = topFeature.geometry.coordinates;
    const locationName =
      topFeature.properties.full_address ||
      topFeature.properties.place_formatted ||
      topFeature.properties.name;

    return {
      location: locationName,
      lat: latitude.toString(),
      lng: longitude.toString(),
      rawCoordinates: {
        latitude,
        longitude,
      },
    };
  }

  throw new BadRequestError(
    "Either location name or coordinates (lat/lng) must be provided"
  );
}

/**
 * Validates travel feasibility between previous event and new event
 * Checks if the travel time is reasonable given the time gap between events
 *
 * @throws BadRequestError if travel logistics are impossible
 */
export async function validateTravelLogistics(
  newEventStart: Date,
  newLocation: ValidatedLocation,
  previousEvent: PreviousEvent | null
): Promise<TravelValidationResult> {
  // No previous event to compare against
  if (!previousEvent) {
    return {
      isValid: true,
    };
  }

  // Previous event has no location
  if (!previousEvent.lat || !previousEvent.lng) {
    return {
      isValid: true,
    };
  }

  const previousLat = parseFloat(previousEvent.lat);
  const previousLng = parseFloat(previousEvent.lng);

  // Validate coordinates
  if (isNaN(previousLat) || isNaN(previousLng)) {
    return {
      isValid: true,
    };
  }

  // Check if new event starts before previous event ends (immediate error)
  if (newEventStart < previousEvent.end) {
    return {
      isValid: false,
      message: `Event time conflict: New event starts at ${newEventStart.toISOString()} but previous event doesn't end until ${previousEvent.end.toISOString()}. Please schedule the new event after the previous event ends.`,
    };
  }

  // Calculate time difference (in minutes)
  const timeDiffMinutes =
    (newEventStart.getTime() - previousEvent.end.getTime()) / (1000 * 60);

  // If events are more than 8 hours apart, no validation needed
  if (timeDiffMinutes >= 480) {
    return {
      isValid: true,
    };
  }

  // Get travel time between locations
  const travelTimeMinutes = await mapboxService.getTravelTime(
    {
      latitude: previousLat,
      longitude: previousLng,
    },
    {
      latitude: newLocation.rawCoordinates.latitude,
      longitude: newLocation.rawCoordinates.longitude,
    },
    MapboxProfile.DRIVING
  );

  const distanceKm = await mapboxService.getDistance(
    {
      latitude: previousLat,
      longitude: previousLng,
    },
    {
      latitude: newLocation.rawCoordinates.latitude,
      longitude: newLocation.rawCoordinates.longitude,
    },
    MapboxProfile.DRIVING
  );

  if (travelTimeMinutes === null || distanceKm === null) {
    return {
      isValid: true,
    };
  }

  // Check if travel is feasible
  const requiredBuffer = travelTimeMinutes + 15; // 15 min buffer for prep/cleanup

  if (timeDiffMinutes < requiredBuffer) {
    const minutesNeeded = (requiredBuffer - timeDiffMinutes).toFixed(0);
    return {
      isValid: false,
      message: `Insufficient time for travel between events. Previous event ends ${previousEvent.end.toISOString()}, new event starts ${newEventStart.toISOString()}. Travel takes ${travelTimeMinutes} minutes (${distanceKm.toFixed(1)}km), with 15 minutes buffer = ${requiredBuffer} minutes needed. But only ${timeDiffMinutes.toFixed(0)} minutes available. Need ${minutesNeeded} more minutes.`,
      travelTimeMinutes,
      distanceKm,
    };
  }

  return {
    isValid: true,
    travelTimeMinutes,
    distanceKm,
  };
}

/**
 * Gets the most recent event with a location for a user
 * Used to validate travel logistics for new events
 */
export async function getMostRecentLocationEvent(
  userId: string,
  eventRepository: any
): Promise<PreviousEvent | null> {
  try {
    const event = await eventRepository
      .createQueryBuilder("event")
      .where("event.createdById = :userId", { userId })
      .andWhere("event.lat IS NOT NULL")
      .andWhere("event.lng IS NOT NULL")
      .orderBy("event.end", "DESC")
      .limit(1)
      .getOne();

    return event || null;
  } catch {
    return null;
  }
}

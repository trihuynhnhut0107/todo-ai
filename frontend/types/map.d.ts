// types/mapbox.types.ts
export interface MapboxFeature {
  type: string;
  id: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    mapbox_id: string;
    feature_type: string;
    full_address: string;
    name: string;
    name_preferred: string;
    coordinates: {
      longitude: number;
      latitude: number;
    };
    place_formatted: string;
    context: {
      street?: { name: string };
      neighborhood?: { name: string };
      postcode?: { name: string };
      locality?: { name: string };
      place?: { name: string };
      region?: { name: string };
      country?: { name: string };
    };
  };
}

export interface MapboxGeocodingResponse {
  type: string;
  features: MapboxFeature[];
  attribution?: string;
}
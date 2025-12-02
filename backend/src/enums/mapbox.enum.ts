/**
 * Mapbox routing profiles for directions and matrix APIs
 */
export enum MapboxProfile {
  DRIVING = "driving",
  WALKING = "walking",
  CYCLING = "cycling",
  DRIVING_TRAFFIC = "driving-traffic",
}

/**
 * Common ISO 639-1 language codes for Mapbox APIs
 */
export enum MapboxLanguage {
  ENGLISH = "en",
  SPANISH = "es",
  FRENCH = "fr",
  GERMAN = "de",
  ITALIAN = "it",
  PORTUGUESE = "pt",
  CHINESE = "zh",
  JAPANESE = "ja",
  KOREAN = "ko",
  RUSSIAN = "ru",
  ARABIC = "ar",
  VIETNAMESE = "vi",
  THAI = "th",
  DUTCH = "nl",
  POLISH = "pl",
  TURKISH = "tr",
  SWEDISH = "sv",
  INDONESIAN = "id",
  HEBREW = "he",
  HINDI = "hi",
}

/**
 * Common ISO 3166-1 alpha-2 country codes
 */
export enum MapboxCountry {
  UNITED_STATES = "us",
  CANADA = "ca",
  UNITED_KINGDOM = "gb",
  FRANCE = "fr",
  GERMANY = "de",
  ITALY = "it",
  SPAIN = "es",
  MEXICO = "mx",
  BRAZIL = "br",
  ARGENTINA = "ar",
  CHINA = "cn",
  JAPAN = "jp",
  SOUTH_KOREA = "kr",
  INDIA = "in",
  AUSTRALIA = "au",
  NEW_ZEALAND = "nz",
  RUSSIA = "ru",
  NETHERLANDS = "nl",
  BELGIUM = "be",
  SWITZERLAND = "ch",
  AUSTRIA = "at",
  POLAND = "pl",
  SWEDEN = "se",
  NORWAY = "no",
  DENMARK = "dk",
  FINLAND = "fi",
  PORTUGAL = "pt",
  GREECE = "gr",
  TURKEY = "tr",
  ISRAEL = "il",
  SAUDI_ARABIA = "sa",
  UNITED_ARAB_EMIRATES = "ae",
  SINGAPORE = "sg",
  THAILAND = "th",
  VIETNAM = "vn",
  PHILIPPINES = "ph",
  INDONESIA = "id",
  MALAYSIA = "my",
  SOUTH_AFRICA = "za",
  EGYPT = "eg",
  NIGERIA = "ng",
  CHILE = "cl",
  COLOMBIA = "co",
  PERU = "pe",
  VENEZUELA = "ve",
}

/**
 * Mapbox place types for filtering geocoding results
 */
export enum MapboxPlaceType {
  COUNTRY = "country",
  REGION = "region",
  POSTCODE = "postcode",
  DISTRICT = "district",
  PLACE = "place",
  LOCALITY = "locality",
  NEIGHBORHOOD = "neighborhood",
  ADDRESS = "address",
  POI = "poi", // Point of Interest
  STREET = "street",
}

/**
 * Approach types for routing
 */
export enum MapboxApproach {
  UNRESTRICTED = "unrestricted",
  CURB = "curb",
}

/**
 * Matrix API annotation types
 */
export enum MapboxAnnotation {
  DURATION = "duration",
  DISTANCE = "distance",
  DURATION_DISTANCE = "duration,distance",
}

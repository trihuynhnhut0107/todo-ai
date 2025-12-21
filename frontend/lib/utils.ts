import { EventStatus } from "@/enum/event";
import { Linking, Platform } from "react-native";

export function getColorFromString(str: string): string {
  let hash = 0;

  // Create a simple hash from the string
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert the hash into a color
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }

  return color;
}

export function getDatesBetween(start: Date | string, end: Date | string) {
  const dates = [];

  const current = new Date(start.toString().split("/").reverse().join("-"));
  const last = new Date(end.toString().split("/").reverse().join("-"));

  while (current <= last) {
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    const year = current.getFullYear();
    dates.push(`${year}-${month}-${day}`);

    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function spreadEvent(event: any) {
  const events = [];

  let s = new Date(event.start);
  const e = new Date(event.end);

  while (s < e) {
    const nextMidnight = new Date(s);
    nextMidnight.setHours(24, 0, 0, 0);

    // Choose where this segment ends
    let segmentEnd = nextMidnight < e ? nextMidnight : e;

    // If segment ends exactly on midnight, shift end back 1 ms
    if (
      segmentEnd.getHours() === 0 &&
      segmentEnd.getMinutes() === 0 &&
      segmentEnd < e
    ) {
      segmentEnd = new Date(segmentEnd.getTime() - 1);
    }

    events.push({
      ...event,
      start: { dateTime: new Date(s) },
      end: { dateTime: new Date(segmentEnd) },
      displayStart: event.start,
      displayEnd: event.end,
    });

    // Next segment starts exactly at the next midnight
    s = nextMidnight;
  }

  return events;
}

export function getReadableTextColor(bgHex: string): string {
  const hex = bgHex.replace("#", "");

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // perceived luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // threshold around mid brightness
  return luminance > 186 ? "#000000" : "#FFFFFF";
}

export const getStatusStyles = (status: EventStatus) => {
  switch (status) {
    case EventStatus.SCHEDULED:
      return "bg-gray-500 border border-gray-500";
    case EventStatus.IN_PROGRESS:
      return "bg-blue-500 border border-blue-500";
    case EventStatus.COMPLETED:
      return "bg-green-500 border border-green-500";
    case EventStatus.CANCELLED:
      return "bg-red-500 border border-red-500";
    default:
      return "bg-gray-500 border border-gray-500";
  }
};

export const getStatusTextStyles = (status: EventStatus) => {
  switch (status) {
    case EventStatus.SCHEDULED:
      return "text-blue-300";
    case EventStatus.IN_PROGRESS:
      return "text-blue-300";
    case EventStatus.COMPLETED:
      return "text-green-300";
    case EventStatus.CANCELLED:
      return "text-red-300";
    default:
      return "text-gray-300";
  }
};

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening";
  } else {
    return "Good night";
  }
};

export const openInGoogleMap = (lng: number, lat: number) => {
  const scheme = Platform.select({
    ios: `comgooglemaps://?q=${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}`,
  });

  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  Linking.canOpenURL(scheme!)
    .then((supported) => {
      if (supported) {
        Linking.openURL(scheme!);
      } else {
        Linking.openURL(fallbackUrl);
      }
    })
    .catch(() => {
      Linking.openURL(fallbackUrl);
    });
};

interface FoundDate {
  original: string;
  date: Date;
  index: number;
}

interface ScanResult {
  foundDates: FoundDate[];
  processedString: string;
  count: number;
}

/**
 * Type for the date processor function
 */
type DateProcessor = (date: Date) => string;

export function scanAndProcessUTCDates(
  input: string,
  processor?: DateProcessor | null
): ScanResult {
  // Regex patterns for different UTC date formats
  const patterns: RegExp[] = [
    // ISO 8601: 2024-03-15T14:30:00.000Z or 2024-03-15T14:30:00Z
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/g,
    // UTC with timezone: 2024-03-15T14:30:00+00:00
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?[+-]\d{2}:\d{2}/g,
  ];

  const foundDates: FoundDate[] = [];
  let processedString = input;

  // Default processor: format to local readable string
  const defaultProcessor: DateProcessor = (dateObj: Date): string => {
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const processorFn = processor || defaultProcessor;

  // Scan for each pattern
  patterns.forEach(pattern => {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(input)) !== null) {
      const dateString = match[0];
      const dateObj = new Date(dateString);

      // Validate the date
      if (!isNaN(dateObj.getTime())) {
        foundDates.push({
          original: dateString,
          date: dateObj,
          index: match.index
        });
      }
    }
  });

  // Sort by index (in reverse) to replace from end to start
  foundDates.sort((a, b) => b.index - a.index);

  // Replace UTC strings with processed versions
  foundDates.forEach(item => {
    const processed = processorFn(item.date);
    processedString = 
      processedString.slice(0, item.index) + 
      processed + 
      processedString.slice(item.index + item.original.length);
  });

  return {
    foundDates: foundDates.reverse(), // Return in original order
    processedString,
    count: foundDates.length
  };
}
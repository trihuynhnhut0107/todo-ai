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

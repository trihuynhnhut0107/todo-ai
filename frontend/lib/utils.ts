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

export function getReadableTextColor(bgHex: string): string {
  const hex = bgHex.replace("#", "");

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

  // threshold around mid brightness
  return luminance > 186 ? "#000000" : "#FFFFFF";
}

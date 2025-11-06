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
  console.log(start + " " + end);

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

export const timeFromNow = (
  timeFrame: "m" | "h" | "d" | "mo" | "y",
  value: number,
  ago?: boolean | string
): Date => {
  // Sets a date based on the inputs
  const now = Date.now();
  const isItPast: boolean = !!ago || false;

  switch (timeFrame) {
    case "m":
      return isItPast
        ? new Date(now - value * 60 * 1000)
        : new Date(now + value * 60 * 1000);

    case "h":
      return isItPast
        ? new Date(now - value * 60 * 60 * 1000)
        : new Date(now + value * 60 * 60 * 1000);
    case "d":
      return isItPast
        ? new Date(now - value * 24 * 60 * 60 * 1000)
        : new Date(now + value * 24 * 60 * 60 * 1000);
    case "mo":
      return isItPast
        ? new Date(now - value * 30 * 24 * 60 * 60 * 1000)
        : new Date(now + value * 30 * 24 * 60 * 60 * 1000);
    case "y":
      return isItPast
        ? new Date(now - value * 12 * 30 * 24 * 60 * 60 * 1000)
        : new Date(now + value * 12 * 30 * 24 * 60 * 60 * 1000);

    default:
      return new Date(now);
  }
};


export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',    // e.g., June
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,     // for AM/PM format
    timeZoneName: 'short' // e.g., GMT
  });
}

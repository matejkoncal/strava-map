export function formatDistance(meters?: number) {
  if (!meters) return "—";
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds?: number) {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  return `${mins}m`;
}

export function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function formatSpeed(speedMs?: number) {
  if (!speedMs) return "—";
  return `${(speedMs * 3.6).toFixed(1)} km/h`;
}

export function formatElevation(meters?: number) {
  if (!meters) return "—";
  return `${Math.round(meters)} m`;
}

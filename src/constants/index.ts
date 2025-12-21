export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
export const STRAVA_CLIENT_ID = "124055";
export const STRAVA_SCOPE = "activity:read_all";
export const STORAGE_KEY = "strava_access_token";
export const REDIRECT_URI =
  typeof window !== "undefined" ? window.location.origin : "";

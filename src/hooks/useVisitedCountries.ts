import { useState, useEffect, useMemo } from "react";
import type { Activity, GeoJSONCollection } from "../types";
import { getCountryFromPoint } from "../utils/geo";

export function useVisitedCountries(activities: Activity[]) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONCollection | null>(
    null
  );

  // Load GeoJSON once
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
    )
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error("Failed to load countries GeoJSON", err));
  }, []);

  // Calculate visited countries locally
  const { visitedCountries, activityCountries } = useMemo(() => {
    const visited = new Set<string>();
    const activityMap = new Map<number, string>();

    if (!geoJsonData || activities.length === 0) {
      return { visitedCountries: visited, activityCountries: activityMap };
    }

    const coordCache = new Map<string, string | null>();

    for (const activity of activities) {
      if (!activity.start_latlng || activity.start_latlng.length !== 2)
        continue;

      const [lat, lng] = activity.start_latlng;
      // Round to 1 decimal place to reduce checks for very close points
      const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;

      let countryCode = coordCache.get(key);

      if (countryCode === undefined) {
        countryCode = getCountryFromPoint(lat, lng, geoJsonData.features);
        coordCache.set(key, countryCode);
      }

      if (countryCode) {
        visited.add(countryCode);
        activityMap.set(activity.id, countryCode);
      }
    }

    return { visitedCountries: visited, activityCountries: activityMap };
  }, [activities, geoJsonData]);

  return { visitedCountries, activityCountries, geoJsonData };
}

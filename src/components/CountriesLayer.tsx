import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import type { GeoJSONCollection } from "../types";

export function CountriesLayer({
  visitedCountries,
  visible,
  geoJsonData,
}: {
  visitedCountries: Set<string>;
  visible: boolean;
  geoJsonData: GeoJSONCollection | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !geoJsonData) return;

    // Add GeoJSON data directly
    map.data.addGeoJson(geoJsonData);

    return () => {
      map.data.forEach((feature: google.maps.Data.Feature) => {
        map.data.remove(feature);
      });
    };
  }, [map, geoJsonData]);

  useEffect(() => {
    if (!map) return;

    map.data.setStyle((feature: google.maps.Data.Feature) => {
      if (!visible) {
        return { visible: false };
      }

      const countryCode = feature.getProperty("ISO3166-1-Alpha-2") as string;
      const isVisited = visitedCountries.has(countryCode);

      return {
        fillColor: isVisited ? "#6366f1" : "#0f172a", // Indigo for visited, Dark Slate for others
        fillOpacity: isVisited ? 0.5 : 0.8,
        strokeColor: "#334155",
        strokeWeight: 1,
        visible: true,
        clickable: false,
      };
    });
  }, [map, visitedCountries, visible]);

  return null;
}

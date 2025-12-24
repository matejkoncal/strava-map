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
        fillColor: isVisited ? "#f97316" : "#0b1324", // Warm accent for visited, deep slate for others
        fillOpacity: isVisited ? 0.85 : 0.4,
        strokeColor: isVisited ? "#fb923c" : "#1f2937",
        strokeWeight: isVisited ? 1.25 : 1,
        visible: true,
        clickable: false,
      };
    });
  }, [map, visitedCountries, visible]);

  return null;
}

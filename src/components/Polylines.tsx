import { useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Activity } from "../types";

export function Polylines({
  activities,
  color,
}: {
  activities: Activity[];
  color: string;
}) {
  const map = useMap();
  const geometryLib = useMapsLibrary("geometry");

  useEffect(() => {
    if (!map || !geometryLib) return;

    const polylines = activities
      .filter((activity) => activity.map?.summary_polyline)
      .map((activity) => {
        const path = geometryLib.encoding.decodePath(
          activity.map!.summary_polyline!
        );

        return new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 1,
          strokeWeight: 4,
          map: map,
          clickable: false, // Make them non-clickable so they don't interfere with markers
          zIndex: 1, // Below markers
        });
      });

    return () => {
      polylines.forEach((polyline) => polyline.setMap(null));
    };
  }, [map, geometryLib, activities, color]);

  return null;
}

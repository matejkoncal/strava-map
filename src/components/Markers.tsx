import { useEffect, useState } from "react";
import { Marker, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { Marker as GoogleMarker } from "@googlemaps/markerclusterer";
import type { Activity } from "../types";

function ClusterMarker({
  activity,
  clusterer,
  onClick,
}: {
  activity: Activity;
  clusterer: MarkerClusterer | null;
  onClick: (activity: Activity) => void;
}) {
  const [marker, setMarker] = useState<GoogleMarker | null>(null);

  useEffect(() => {
    if (marker && clusterer) {
      clusterer.addMarker(marker);
      return () => {
        clusterer.removeMarker(marker);
      };
    }
  }, [marker, clusterer]);

  return (
    <Marker
      position={{
        lat: activity.start_latlng![0],
        lng: activity.start_latlng![1],
      }}
      ref={setMarker}
      onClick={() => onClick(activity)}
    />
  );
}

export function Markers({
  activities,
  onMarkerClick,
}: {
  activities: Activity[];
  onMarkerClick: (activity: Activity) => void;
}) {
  const map = useMap();
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;
    const c = new MarkerClusterer({ map });

    // Use setTimeout to avoid synchronous state update warning
    const timer = setTimeout(() => {
      setClusterer(c);
    }, 0);

    return () => {
      clearTimeout(timer);
      c.clearMarkers();
      c.setMap(null);
    };
  }, [map]);

  return (
    <>
      {activities.map((activity) => (
        <ClusterMarker
          key={activity.id}
          activity={activity}
          clusterer={clusterer}
          onClick={onMarkerClick}
        />
      ))}
    </>
  );
}

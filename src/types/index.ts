export type GeoJSONFeature = {
  type: "Feature";
  properties: {
    "ISO3166-1-Alpha-2": string;
    name: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
};

export type GeoJSONCollection = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
};

export type Activity = {
  id: number;
  name?: string;
  distance?: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  type?: string;
  start_date?: string;
  start_latlng?: [number, number];
  map?: {
    summary_polyline?: string;
  };
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  suffer_score?: number;
  calories?: number;
};

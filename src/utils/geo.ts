import type { GeoJSONFeature } from "../types";

function distToSegmentSquared(
  p: [number, number],
  v: [number, number],
  w: [number, number]
) {
  const l2 = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2;
  if (l2 === 0) return (p[0] - v[0]) ** 2 + (p[1] - v[1]) ** 2;
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return (
    (p[0] - (v[0] + t * (w[0] - v[0]))) ** 2 +
    (p[1] - (v[1] + t * (w[1] - v[1]))) ** 2
  );
}

function getMinDistToRingSquared(
  point: [number, number],
  ring: [number, number][]
) {
  let minDist2 = Infinity;
  for (let i = 0; i < ring.length - 1; i++) {
    const d2 = distToSegmentSquared(point, ring[i], ring[i + 1]);
    if (d2 < minDist2) minDist2 = d2;
  }
  return minDist2;
}

function isPointInPoly(point: [number, number], vs: [number, number][]) {
  // point is [lng, lat], vs is array of [lng, lat]
  const x = point[0],
    y = point[1];

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export function getCountryFromPoint(
  lat: number,
  lng: number,
  features: GeoJSONFeature[]
): string | null {
  const point: [number, number] = [lng, lat]; // GeoJSON uses [lng, lat]

  // Pass 1: Exact match
  for (const feature of features) {
    const geometry = feature.geometry;
    if (!geometry) continue;

    if (geometry.type === "Polygon") {
      // Polygon coordinates: [ [outerRing], [hole1], [hole2]... ]
      // We mostly care about the outer ring for hit testing
      const outerRing = geometry.coordinates[0] as [number, number][];
      if (isPointInPoly(point, outerRing)) {
        return feature.properties["ISO3166-1-Alpha-2"];
      }
    } else if (geometry.type === "MultiPolygon") {
      // MultiPolygon: [ Polygon1, Polygon2 ... ]
      // Polygon: [ [outer], [hole] ... ]
      for (const polygon of geometry.coordinates) {
        const outerRing = polygon[0] as [number, number][];
        if (isPointInPoly(point, outerRing)) {
          return feature.properties["ISO3166-1-Alpha-2"];
        }
      }
    }
  }

  // Pass 2: Fuzzy match (near coast/border)
  // Threshold in degrees. 0.1 deg is roughly 10km.
  const THRESHOLD_SQ = 0.1 * 0.1;
  let bestCandidate: string | null = null;
  let minDistanceSq = Infinity;

  for (const feature of features) {
    const geometry = feature.geometry;
    if (!geometry) continue;

    let distSq = Infinity;

    if (geometry.type === "Polygon") {
      const outerRing = geometry.coordinates[0] as [number, number][];
      distSq = getMinDistToRingSquared(point, outerRing);
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates) {
        const outerRing = polygon[0] as [number, number][];
        const d = getMinDistToRingSquared(point, outerRing);
        if (d < distSq) distSq = d;
      }
    }

    if (distSq < THRESHOLD_SQ && distSq < minDistanceSq) {
      minDistanceSq = distSq;
      bestCandidate = feature.properties["ISO3166-1-Alpha-2"];
    }
  }

  return bestCandidate;
}

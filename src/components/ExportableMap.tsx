import { useMemo, useRef } from "react";
import { Box, Button, Card, Stack, Typography, useTheme } from "@mui/material";
import {
  Download as DownloadIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import * as d3 from "d3-geo";
import html2canvas from "html2canvas";
import type { GeoJSONCollection } from "../types";
import { CountryFlags } from "./CountryFlags";

interface ExportableMapProps {
  geoJsonData: GeoJSONCollection | null;
  visitedCountries: Set<string>;
  year?: number;
  onClose?: () => void;
}

export function ExportableMap({
  geoJsonData,
  visitedCountries,
  year,
}: ExportableMapProps) {
  const theme = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);

  const { paths } = useMemo(() => {
    if (!geoJsonData) return { paths: [], projection: null };

    // Create a projection
    // Natural Earth projection is good for world maps, but might need d3-geo-projection
    // Mercator or Equirectangular are standard in d3-geo
    const width = 800;
    const height = 500; // Aspect ratio for world map

    const projection = d3.geoEquirectangular();

    // Find visited features to calculate bounds
    const visitedFeatures = geoJsonData.features.filter((f) =>
      visitedCountries.has(f.properties?.["ISO3166-1-Alpha-2"])
    );

    if (visitedFeatures.length > 0) {
      const visitedCollection = {
        type: "FeatureCollection",
        features: visitedFeatures,
      };
      // Fit to visited countries with some padding
      projection.fitExtent(
        [
          [50, 50],
          [width - 50, height - 50],
        ],
        visitedCollection as any
      );
    } else {
      projection.fitSize([width, height], geoJsonData as any);
    }

    const pathGenerator = d3.geoPath().projection(projection);

    const paths = geoJsonData.features.map((feature) => {
      const countryCode = feature.properties?.["ISO3166-1-Alpha-2"];
      const isVisited = visitedCountries.has(countryCode);

      return {
        d: pathGenerator(feature as any),
        fill: isVisited ? theme.palette.primary.main : "#1e293b", // Visited vs Default
        stroke: isVisited ? theme.palette.primary.light : "#334155",
        key: countryCode || Math.random().toString(),
      };
    });

    return { paths, projection };
  }, [geoJsonData, visitedCountries, theme]);

  const handleDownload = async () => {
    if (!mapRef.current) return;

    try {
      const canvas = await html2canvas(mapRef.current, {
        backgroundColor: theme.palette.background.paper,
        scale: 4,
        useCORS: true,
        onclone: (clonedDoc) => {
          const container = clonedDoc.getElementById("export-container");
          if (container) {
            // Force container size
            container.style.width = "800px";
            container.style.maxWidth = "none";
            container.style.height = "auto";
            container.style.position = "static";
            container.style.margin = "0";

            // Force SVG size to fill container
            const svgBox = container.querySelector(".map-svg-container");
            if (svgBox) {
              (svgBox as HTMLElement).style.width = "800px";
              (svgBox as HTMLElement).style.height = "500px";
              (svgBox as HTMLElement).style.aspectRatio = "auto";
            }

            const svg = container.querySelector("svg");
            if (svg) {
              svg.style.width = "100%";
              svg.style.height = "100%";
              svg.setAttribute("width", "800");
              svg.setAttribute("height", "500");
            }
          }
        },
      });

      const link = document.createElement("a");
      link.download = `visited-countries-map${year ? `-${year}` : ""}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleShare = async () => {
    if (!mapRef.current) return;

    try {
      const canvas = await html2canvas(mapRef.current, {
        backgroundColor: theme.palette.background.paper,
        scale: 4,
        useCORS: true,
        onclone: (clonedDoc) => {
          const container = clonedDoc.getElementById("export-container");
          if (container) {
            // Force container size
            container.style.width = "800px";
            container.style.maxWidth = "none";
            container.style.height = "auto";
            container.style.position = "static";
            container.style.margin = "0";

            // Force SVG size to fill container
            const svgBox = container.querySelector(".map-svg-container");
            if (svgBox) {
              (svgBox as HTMLElement).style.width = "800px";
              (svgBox as HTMLElement).style.height = "500px";
              (svgBox as HTMLElement).style.aspectRatio = "auto";
            }

            const svg = container.querySelector("svg");
            if (svg) {
              svg.style.width = "100%";
              svg.style.height = "100%";
              svg.setAttribute("width", "800");
              svg.setAttribute("height", "500");
            }
          }
        },
      });

      // Convert to DataURL first (synchronous)
      const dataUrl = canvas.toDataURL("image/png");

      // Convert DataURL to Blob synchronously
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      const file = new File(
        [blob],
        `visited-countries-map${year ? `-${year}` : ""}.png`,
        {
          type: "image/png",
        }
      );

      const shareData = {
        files: [file],
        title: `My visited countries ${year ? year : ""}`,
        text: `Check out the countries I visited${year ? ` in ${year}` : ""}!`,
      };

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // Ignore AbortError
          if ((err as Error).name !== "AbortError") {
            console.error("Share failed", err);
            // Fallback to download
            const link = document.createElement("a");
            link.download = `visited-countries-map${
              year ? `-${year}` : ""
            }.png`;
            link.href = dataUrl;
            link.click();
          }
        }
      } else {
        // Fallback to download
        const link = document.createElement("a");
        link.download = `visited-countries-map${year ? `-${year}` : ""}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Share generation failed", err);
    }
  };

  if (!geoJsonData) return null;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Button
          startIcon={<ShareIcon />}
          variant="outlined"
          onClick={handleShare}
        >
          Share
        </Button>
        <Button
          startIcon={<DownloadIcon />}
          variant="contained"
          onClick={handleDownload}
        >
          Download Image
        </Button>
      </Stack>

      <Card
        ref={mapRef}
        id="export-container"
        sx={{
          p: 3,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
          Visited Countries {year}
        </Typography>

        {visitedCountries.size > 0 && (
          <Box sx={{ my: 1, width: "100%", maxWidth: 800 }}>
            <Stack direction="row" justifyContent="center">
              <CountryFlags
                countries={visitedCountries}
                selectedCountry={null}
                onSelectCountry={() => {}}
              />
            </Stack>
          </Box>
        )}

        <Box
          className="map-svg-container"
          sx={{
            width: "100%",
            maxWidth: 800,
            aspectRatio: "800/500",
            position: "relative",
          }}
        >
          <svg viewBox="0 0 800 500" style={{ width: "100%", height: "100%" }}>
            {paths.map((p) => (
              <path
                key={p.key}
                d={p.d || ""}
                fill={p.fill}
                stroke={p.stroke}
                strokeWidth="0.5"
              />
            ))}
          </svg>
        </Box>
      </Card>
    </Stack>
  );
}

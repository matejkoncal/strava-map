import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import { APIProvider, Map, InfoWindow } from "@vis.gl/react-google-maps";
import type { Activity, GeoJSONCollection } from "../types";
import { GOOGLE_MAPS_API_KEY } from "../constants";
import { formatDistance, formatDuration } from "../utils/format";
import { CountriesLayer } from "./CountriesLayer";
import { Markers } from "./Markers";

export function MapView({
  activities,
  visitedCountries,
  geoJsonData,
}: {
  activities: Activity[];
  visitedCountries: Set<string>;
  geoJsonData: GeoJSONCollection | null;
}) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [showPins, setShowPins] = useState(true);
  const [showCountries, setShowCountries] = useState(false);

  const activitiesWithCoords = activities.filter(
    (a) => a.start_latlng && a.start_latlng.length === 2
  );

  if (activitiesWithCoords.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: 2,
        }}
      >
        <Typography>No activities with coordinates.</Typography>
      </Box>
    );
  }

  const center = {
    lat: activitiesWithCoords[0].start_latlng![0],
    lng: activitiesWithCoords[0].start_latlng![1],
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showPins}
              onChange={(e) => setShowPins(e.target.checked)}
            />
          }
          label={
            <Typography variant="caption" color="text.secondary">
              Activities
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showCountries}
              onChange={(e) => setShowCountries(e.target.checked)}
            />
          }
          label={
            <Typography variant="caption" color="text.secondary">
              Countries
            </Typography>
          }
        />
      </Stack>

      <Box
        sx={{
          height: { xs: "400px", md: "600px" },
          width: "100%",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={center}
            defaultZoom={10}
            mapId="DEMO_MAP_ID"
            style={{ width: "100%", height: "100%" }}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
          >
            <CountriesLayer
              visitedCountries={visitedCountries}
              visible={showCountries}
              geoJsonData={geoJsonData}
            />

            {showPins && (
              <Markers
                activities={activitiesWithCoords}
                onMarkerClick={setSelectedActivity}
              />
            )}

            {selectedActivity && (
              <InfoWindow
                position={{
                  lat: selectedActivity.start_latlng![0],
                  lng: selectedActivity.start_latlng![1],
                }}
                onCloseClick={() => setSelectedActivity(null)}
              >
                <Stack spacing={1} sx={{ minWidth: 200, color: "black" }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ color: "black" }}
                  >
                    {selectedActivity.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={selectedActivity.type}
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(0,0,0,0.6)" }}
                    >
                      {new Date(
                        selectedActivity.start_date!
                      ).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ color: "black" }}
                    >
                      {formatDistance(selectedActivity.distance)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(0,0,0,0.6)" }}
                    >
                      {formatDuration(selectedActivity.moving_time)}
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    href={`https://www.strava.com/activities/${selectedActivity.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<OpenInNewIcon />}
                    sx={{ mt: 1, fontSize: "0.75rem" }}
                  >
                    Open on Strava
                  </Button>
                </Stack>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </Box>
    </Stack>
  );
}

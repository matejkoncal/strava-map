import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import {
  DirectionsRun as RunIcon,
  DirectionsBike as BikeIcon,
  OpenInNew as OpenInNewIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import type { Activity } from "../types";
import { formatDistance, formatDuration } from "../utils/format";
import { ActivityDetailDialog } from "./ActivityDetailDialog";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        fontWeight={600}
        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  );
}

export function ActivityList({ activities }: { activities: Activity[] }) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: "rgba(99, 102, 241, 0.1)",
            color: "primary.main",
          }}
        >
          <TimelineIcon />
        </Box>
        <Typography variant="h5" fontWeight="bold">
          All Activities ({activities.length})
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {activities.map((activity) => (
          <Box key={activity.id}>
            <Card
              onClick={() => setSelectedActivity(activity)}
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                  borderColor: "primary.main",
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                >
                  <Stack spacing={1} flex={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="h6" fontWeight="bold">
                        {activity.name || "Untitled"}
                      </Typography>
                      {activity.type && (
                        <Chip
                          label={activity.type}
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon={
                            activity.type === "Run" ? (
                              <RunIcon fontSize="small" />
                            ) : (
                              <BikeIcon fontSize="small" />
                            )
                          }
                        />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={4}>
                      <Metric
                        label="Vzdialenosť"
                        value={formatDistance(activity.distance)}
                      />
                      <Metric
                        label="Čas"
                        value={formatDuration(activity.moving_time)}
                      />
                      {activity.start_date && (
                        <Metric
                          label="Dátum"
                          value={new Date(
                            activity.start_date
                          ).toLocaleDateString()}
                        />
                      )}
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`ID: ${activity.id}`}
                      size="small"
                      variant="outlined"
                      sx={{ opacity: 0.5, fontFamily: "monospace" }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      href={`https://www.strava.com/activities/${activity.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        minWidth: "auto",
                        px: 1,
                        borderColor: "rgba(255,255,255,0.1)",
                      }}
                      title="Otvoriť na Strave"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Stack>

      <ActivityDetailDialog
        activity={selectedActivity}
        open={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
      />
    </Stack>
  );
}

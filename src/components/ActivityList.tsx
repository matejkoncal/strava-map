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
  OpenInNew as OpenInNewIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import type { Activity } from "../types";
import { formatDistance, formatDuration } from "../utils/format";
import { ActivityDetailDialog } from "./ActivityDetailDialog";
import { getActivityIcon } from "../utils/getActivityIcon";
import { getActivityLabel } from "../utils/getActivityLabel";

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

const getActivityColor = (type?: string) => {
  switch (type) {
    case "Run":
      return "#ef6c00"; // Orange
    case "Ride":
      return "#d32f2f"; // Red
    case "Swim":
      return "#0288d1"; // Blue
    case "Walk":
      return "#4caf50"; // Green
    case "Hike":
      return "#795548"; // Brown
    default:
      return "#757575"; // Grey
  }
};

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
                borderRight: `6px solid ${getActivityColor(activity.sport_type)}`,
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
                      {activity.sport_type && (
                        <Chip
                          label={getActivityLabel(activity.sport_type)}
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon={getActivityIcon(activity.sport_type)}
                        />
                      )}
                    </Stack>
                    <Stack direction="row" spacing={4}>
                      <Metric
                        label="Distance"
                        value={formatDistance(activity.distance)}
                      />
                      <Metric
                        label="Time"
                        value={formatDuration(activity.moving_time)}
                      />
                      {activity.start_date && (
                        <Metric
                          label="Date"
                          value={new Date(
                            activity.start_date
                          ).toLocaleDateString()}
                        />
                      )}
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
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
                      title="Open on Strava"
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

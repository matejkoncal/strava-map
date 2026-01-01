import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  OpenInNew as OpenInNewIcon,
  Speed as SpeedIcon,
  Terrain as ElevationIcon,
  Timer as TimerIcon,
  Straighten as DistanceIcon,
  Favorite as HeartIcon,
  LocalFireDepartment as CaloriesIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import type { Activity } from "../types";
import {
  formatDistance,
  formatDuration,
  formatElevation,
  formatSpeed,
} from "../utils/format";
import { getActivityIcon } from "../utils/getActivityIcon";
import { getActivityLabel } from "../utils/getActivityLabel";


interface ActivityDetailDialogProps {
  activity?: Activity | null;
  activities?: Activity[];
  date?: Date | null;
  open: boolean;
  onClose: () => void;
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ color: "text.secondary" }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="500">
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export function ActivityDetailDialog({
  activity,
  activities,
  date,
  open,
  onClose,
}: ActivityDetailDialogProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  // Reset selected activity when dialog opens/closes or props change
  useEffect(() => {
    if (!open) {
      setSelectedActivity(null);
    }
  }, [open]);

  const listMode =
    !activity && activities && activities.length > 1 && !selectedActivity;
  const currentActivity =
    selectedActivity ||
    activity ||
    (activities && activities.length === 1 ? activities[0] : null);

  if (!open) return null;
  if (!listMode && !currentActivity) return null;

  if (listMode && activities) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Activities {date ? date.toLocaleDateString("en-US") : ""}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {activities.map((a) => (
              <Button
                key={a.id}
                variant="outlined"
                fullWidth
                onClick={() => setSelectedActivity(a)}
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  p: 2,
                  borderColor: "divider",
                  color: "text.primary",
                }}
              >
                <Stack spacing={0.5} width="100%">
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {a.name}
                    </Typography>
                    {getActivityIcon(a.sport_type)}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistance(a.distance)} •{" "}
                    {formatDuration(a.moving_time)}
                  </Typography>
                </Stack>
              </Button>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (!currentActivity) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: "background.paper",
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              {selectedActivity && (
                <IconButton
                  size="small"
                  onClick={() => setSelectedActivity(null)}
                  sx={{ ml: -1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography variant="h5" fontWeight="bold" sx={{ pr: 4 }}>
                {currentActivity.name}
              </Typography>
            </Stack>
            {currentActivity.sport_type && (
              <Chip
                label={getActivityLabel(currentActivity.sport_type)}
                color="primary"
                size="small"
                icon={getActivityIcon(currentActivity.sport_type)}
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {currentActivity.start_date &&
              new Date(currentActivity.start_date).toLocaleString("en-US", {
                dateStyle: "full",
                timeStyle: "short",
              })}
          </Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 3 }}>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
          gap={3}
        >
          <DetailItem
            icon={<DistanceIcon />}
            label="Distance"
            value={formatDistance(currentActivity.distance)}
          />
          <DetailItem
            icon={<TimerIcon />}
            label="Moving Time"
            value={formatDuration(currentActivity.moving_time)}
          />
          <DetailItem
            icon={<ElevationIcon />}
            label="Elevation Gain"
            value={formatElevation(currentActivity.total_elevation_gain)}
          />
          <DetailItem
            icon={<SpeedIcon />}
            label="Avg Speed"
            value={formatSpeed(currentActivity.average_speed)}
          />
          {currentActivity.max_speed && (
            <DetailItem
              icon={<SpeedIcon color="error" />}
              label="Max Speed"
              value={formatSpeed(currentActivity.max_speed)}
            />
          )}
          {currentActivity.average_heartrate && (
            <DetailItem
              icon={<HeartIcon color="error" />}
              label="Avg Heart Rate"
              value={`${Math.round(currentActivity.average_heartrate)} bpm`}
            />
          )}
          {currentActivity.calories && (
            <DetailItem
              icon={<CaloriesIcon color="warning" />}
              label="Calories"
              value={`${Math.round(currentActivity.calories)} kcal`}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          variant="contained"
          href={`https://www.strava.com/activities/${currentActivity.id}`}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<OpenInNewIcon />}
        >
          Open on Strava
        </Button>
      </DialogActions>
    </Dialog>
  );
}
